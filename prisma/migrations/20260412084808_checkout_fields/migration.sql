-- DropForeignKey
ALTER TABLE "Pedido" DROP CONSTRAINT "Pedido_clienteId_fkey";

-- AlterTable
ALTER TABLE "Direccion" ADD COLUMN     "departamento" TEXT,
ADD COLUMN     "numero" TEXT,
ADD COLUMN     "piso" TEXT;

-- AlterTable
ALTER TABLE "Pedido" ADD COLUMN     "compradorEmail" TEXT,
ADD COLUMN     "compradorNombre" TEXT,
ADD COLUMN     "compradorTelefono" TEXT,
ADD COLUMN     "costoEnvio" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "mpPaymentId" TEXT,
ADD COLUMN     "mpStatus" TEXT,
ADD COLUMN     "tipoEnvio" TEXT,
ALTER COLUMN "clienteId" DROP NOT NULL,
ALTER COLUMN "metodoPago" DROP NOT NULL;

-- AlterTable
ALTER TABLE "PedidoItem" ADD COLUMN     "color" TEXT,
ADD COLUMN     "imagen" TEXT,
ADD COLUMN     "talle" TEXT,
ALTER COLUMN "productoDevhubId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Pedido_estado_idx" ON "Pedido"("estado");

-- CreateIndex
CREATE INDEX "Pedido_compradorEmail_idx" ON "Pedido"("compradorEmail");

-- CreateIndex
CREATE INDEX "Pedido_mpPaymentId_idx" ON "Pedido"("mpPaymentId");

-- CreateIndex
CREATE INDEX "Pedido_createdAt_idx" ON "Pedido"("createdAt");

-- CreateIndex
CREATE INDEX "PedidoItem_pedidoId_idx" ON "PedidoItem"("pedidoId");

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;
