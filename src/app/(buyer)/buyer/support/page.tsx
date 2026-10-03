import { AccountWorkspace } from "@/components/commerce/account/AccountWorkspace";
import { SupportCenterContent } from "@/components/support/SupportCenterContent";

export default function BuyerSupportPage() {
  return (
    <AccountWorkspace
      activeTab="support"
      title="الدعم"
      description="الوصول إلى الوظائف الحقيقية المرتبطة بالحساب والطلبات."
    >
      <SupportCenterContent />
    </AccountWorkspace>
  );
}
