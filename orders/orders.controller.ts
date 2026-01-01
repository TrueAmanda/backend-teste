import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
  NotFoundException,
  UseGuards,
  Req,
  BadRequestException,
  InternalServerErrorException
} from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { 
  ApiTags, 
  ApiConsumes, 
  ApiBody, 
  ApiOperation, 
  ApiResponse, 
  ApiQuery,
  ApiBearerAuth,
  ApiSecurity
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { S3Service } from '../s3/s3.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';
import { ReceiptService } from './receipt.service';

@ApiTags('orders')
@ApiBearerAuth('access-token')
@Controller('orders')
export class OrdersController {
  private readonly logger = new Logger(OrdersController.name);

  constructor(
    private svc: OrdersService, 
    private s3: S3Service, 
    private receiptSvc: ReceiptService
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Cria um novo pedido' })
  @ApiBody({
    description: 'Dados para criação do pedido',
    type: CreateOrderDto,
    examples: {
      exemplo_completo: {
        summary: 'Exemplo completo',
        value: {
          clienteId: '695427c0de4192685d824768',
          data: '2024-12-30T15:30:00.000Z',
          itens: [
            {
              produto: 'Notebook Dell',
              quantidade: 2,
              precoUnitarioUSD: 999.99
            }
          ]
        }
      },
      exemplo_minimo: {
        summary: 'Exemplo mínimo',
        value: {
          data: '2024-12-30T15:30:00.000Z',
          itens: [
            {
              produto: 'Notebook Dell',
              quantidade: 1,
              precoUnitarioUSD: 999.99
            }
          ]
        }
      }
    }
  })
  @ApiResponse({ status: 201, description: 'Pedido criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async create(@Body() dto: CreateOrderDto, @Req() req: Request) {
    // Se clienteId não for fornecido, pega do token JWT
    const user = (req as any).user;
    if (!dto.clienteId && user && user.sub) {
      dto.clienteId = user.sub;
    }
    return this.svc.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os pedidos com paginação' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número da página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Itens por página' })
  @ApiResponse({ status: 200, description: 'Lista de pedidos retornada com sucesso' })
  @ApiResponse({ status: 400, description: 'Parâmetros de paginação inválidos' })
  async list(
    @Query('page') page = '1',
    @Query('limit') limit = '10'
  ) {
    return this.svc.findAll(Number(page), Number(limit));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um pedido pelo ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Pedido encontrado com sucesso',
    schema: {
      type: 'object',
      example: {
        _id: "507f1f77bcf86cd799439012",
        clienteId: "507f1f77bcf86cd799439013",
        data: "2024-12-30T15:30:00.000Z",
        itens: [
          {
            produto: "Notebook Dell",
            quantidade: 1,
            precoUnitarioUSD: 999.99,
            _id: "507f1f77bcf86cd799439014"
          }
        ],
        valorTotalUSD: 999.99,
        valorTotalBRL: 5487.24,
        comprovanteURL: "https://s3.amazonaws.com/bucket/receipt.pdf",
        createdAt: "2024-12-30T15:30:00.000Z"
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Pedido não encontrado' })
  @ApiResponse({ status: 400, description: 'ID inválido' })
  async get(@Param('id') id: string) {
    const order = await this.svc.findOne(id);
    if (!order) {
      throw new NotFoundException('Pedido não encontrado');
    }
    return order;
  }

  @Post(':id/comprovante')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Faz upload do comprovante de pagamento' })
  @ApiResponse({ status: 200, description: 'Comprovante enviado com sucesso' })
  @ApiResponse({ status: 400, description: 'Arquivo não fornecido ou inválido' })
  @ApiResponse({ status: 404, description: 'Pedido não encontrado' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ 
    description: 'Upload de comprovante', 
    schema: { 
      type: 'object', 
      properties: { 
        file: { 
          type: 'string', 
          format: 'binary' 
        } 
      } 
    } 
  })
  @UseInterceptors(FileInterceptor('file', { 
    storage: memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|pdf)$/)) {
        return cb(new Error('Apenas arquivos JPG, PNG e PDF são permitidos!'), false);
      }
      cb(null, true);
    }
  }))
  async uploadReceipt(
    @Param('id') id: string, 
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo foi enviado');
    }

    try {
      const url = await this.s3.uploadFile(file);
      const updatedOrder = await this.svc.update(id, { 
        comprovanteURL: url 
      });
      
      return {
        message: 'Comprovante enviado com sucesso',
        url,
        order: updatedOrder
      };
    } catch (error) {
      this.logger.error('Erro ao fazer upload do comprovante', error.stack);
      throw new InternalServerErrorException('Falha ao fazer upload do comprovante');
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza um pedido existente' })
  @ApiResponse({ status: 200, description: 'Pedido atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Pedido não encontrado' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async update(@Param('id') id: string, @Body() updateData: any) {
    return this.svc.update(id, updateData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um pedido' })
  @ApiResponse({ status: 200, description: 'Pedido removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Pedido não encontrado' })
  @ApiResponse({ status: 400, description: 'ID inválido' })
  async remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }
}
