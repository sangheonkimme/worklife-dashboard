-- CreateTable
CREATE TABLE "dashboard_checklist_items" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dashboard_checklist_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "dashboard_checklist_items_userId_isCompleted_idx" ON "dashboard_checklist_items"("userId", "isCompleted");

-- CreateIndex
CREATE INDEX "dashboard_checklist_items_userId_order_idx" ON "dashboard_checklist_items"("userId", "order");

-- AddForeignKey
ALTER TABLE "dashboard_checklist_items" ADD CONSTRAINT "dashboard_checklist_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
