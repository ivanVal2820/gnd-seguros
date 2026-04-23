-- CreateTable
CREATE TABLE "PolicyNotificationLog" (
    "id" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "sentTo" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PolicyNotificationLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PolicyNotificationLog_policyId_type_sentTo_key" ON "PolicyNotificationLog"("policyId", "type", "sentTo");

-- AddForeignKey
ALTER TABLE "PolicyNotificationLog" ADD CONSTRAINT "PolicyNotificationLog_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "Policy"("id") ON DELETE CASCADE ON UPDATE CASCADE;
