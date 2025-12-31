import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { OrdersService } from './orders.service';
import { CustomersService } from '../customers/customers.service';
import { S3Service } from '../s3/s3.service';

@Injectable()
export class ReceiptService {
  private readonly logger = new Logger(ReceiptService.name);

  constructor(private orders: OrdersService, private customers: CustomersService, private s3: S3Service) {}

  private async generatePdfBuffer(order: any, customer: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const chunks: Uint8Array[] = [];
        doc.on('data', (chunk: Uint8Array) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));

        const pageWidth = doc.page.width;
        const margin = 50;
        const usableWidth = pageWidth - margin * 2;

        // Header branding: split left/right to avoid overlap
        const headerColumnWidth = usableWidth / 2;
        doc.font('Helvetica-Bold').fontSize(22).fillColor('#111111').text('NextBuy', margin, 48, { width: headerColumnWidth });
        doc.font('Helvetica').fontSize(9).fillColor('gray').text('Soluções inteligentes em compras', margin, 72, {
          width: headerColumnWidth
        });
        doc
          .font('Helvetica-Bold')
          .fontSize(18)
          .fillColor('black')
          .text('Comprovante de Pedido', margin + headerColumnWidth, 55, {
            width: headerColumnWidth,
            align: 'right'
          });

        // Horizontal rule
        doc.moveTo(margin, 95).lineTo(pageWidth - margin, 95).stroke();

        // Order info
        doc.moveDown();
        doc.font('Helvetica-Bold').fontSize(12).text('Informações do Pedido', margin, 110);
        doc.font('Helvetica').fontSize(10);
        const infoY = 130;
        doc.text(`Pedido: ${order._id}`, margin, infoY);
        doc.text(`Data: ${new Date(order.data).toLocaleString()}`, margin, infoY + 15);
        doc.text(`Cliente: ${customer?.nome ?? 'N/A'} (${customer?.email ?? 'N/A'})`, margin, infoY + 30);

        // Items table layout definitions (fixed widths/positions for consistency)
        const tableTop = infoY + 60;
        const colGap = 10;
        const colProductWidth = 155;
        const colQtyWidth = 70;
        const colUnitWidth = 115;
        const colSubtotalWidth = 100;
        const totalTableWidth = colProductWidth + colQtyWidth + colUnitWidth + colSubtotalWidth + colGap * 3;
        const startX = margin;
        const colProductX = startX;
        const colQtyX = colProductX + colProductWidth + colGap;
        const colUnitX = colQtyX + colQtyWidth + colGap;
        const colSubtotalX = colUnitX + colUnitWidth + colGap;

        // Table header
        doc.font('Helvetica-Bold').fontSize(11);
        doc.text('Produto', colProductX, tableTop, { width: colProductWidth, ellipsis: true, lineBreak: false });
        doc.text('Quantidade', colQtyX, tableTop, {
          width: colQtyWidth,
          align: 'center',
          lineBreak: false
        });
        doc.text('Preço unitário (USD)', colUnitX, tableTop, { width: colUnitWidth, align: 'right', lineBreak: false });
        doc.text('Subtotal (USD)', colSubtotalX, tableTop, { width: colSubtotalWidth, align: 'right', lineBreak: false });

        const headerSeparatorY = tableTop + 16;
        doc.moveTo(margin, headerSeparatorY).lineTo(pageWidth - margin, headerSeparatorY).stroke();

        // Table rows
        doc.font('Helvetica').fontSize(10);
        let y = headerSeparatorY + 4;
        const rowHeight = 14;
        const formatUSD = (v: number) => `$${v.toFixed(2)}`;

        for (const it of order.itens || []) {
          // Page break if needed (ensure space for row + totals block)
          if (y > doc.page.height - margin - 160) {
            doc.addPage();
            y = margin;
          }

          const subtotal = Math.round(((it.precoUnitarioUSD || 0) * (it.quantidade || 0)) * 100) / 100;

          doc.text(it.produto ?? '-', colProductX, y, {
            width: colProductWidth,
            ellipsis: true,
            lineBreak: false
          });
          doc.text(String(it.quantidade ?? ''), colQtyX, y, {
            width: colQtyWidth,
            align: 'center'
          });
          doc.text(formatUSD(it.precoUnitarioUSD || 0), colUnitX, y, {
            width: colUnitWidth,
            align: 'right'
          });
          doc.text(formatUSD(subtotal), colSubtotalX, y, {
            width: colSubtotalWidth,
            align: 'right'
          });

          y += rowHeight;
        }

        // Totals block with spacing below table (keeps table intact)
        const totalsTop = y + 30;
        doc.moveTo(startX, totalsTop - 12).lineTo(pageWidth - margin, totalsTop - 12).stroke();

        doc.font('Helvetica-Bold').fontSize(11).fillColor('black');
        const totalUSD = Math.round((order.valorTotalUSD ?? 0) * 100) / 100;
        const totalBRL = Math.round((order.valorTotalBRL ?? 0) * 100) / 100;
        const totalsBlockWidth = 220;
        const totalsX = pageWidth - margin - totalsBlockWidth;

        doc.text(`Total (USD): ${formatUSD(totalUSD)}`, totalsX, totalsTop, {
          width: totalsBlockWidth,
          align: 'right'
        });
        doc.text(`Total (BRL): R$${totalBRL.toFixed(2)}`, totalsX, totalsTop + 20, {
          width: totalsBlockWidth,
          align: 'right'
        });

        // Footer
        const footerY = doc.page.height - margin - 30;
        doc.font('Helvetica').fontSize(9).fillColor('gray');
        doc.text('Este documento é um comprovante gerado automaticamente pelo sistema.', margin, footerY, { align: 'left' });
        doc.text(`Gerado em: ${new Date().toLocaleString()}`, margin, footerY + 12, { align: 'left' });

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }

  async generateAndUpload(orderId: string) {
    const order = await this.orders.findOne(orderId);
    if (!order) throw new NotFoundException('Order not found');

    const customer = await this.customers.findOne(
      typeof order.clienteId === 'object' && order.clienteId ? order.clienteId._id.toString() : order.clienteId?.toString()
    );

    this.logger.log(`Generating PDF for order ${orderId}`);
    const buf = await this.generatePdfBuffer(order, customer);
    const filename = `receipt_${orderId}_${Date.now()}.pdf`;

    const url = await this.s3.uploadBuffer(filename, buf, 'application/pdf');

    await this.orders.update(orderId, { receiptUrl: url } as any);

    this.logger.log(`Generated and uploaded receipt for order ${orderId}: ${url}`);
    return url;
  }
}
