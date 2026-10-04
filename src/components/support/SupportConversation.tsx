import {
  Headphones,
  ShieldCheck,
} from "lucide-react";

import type {
  SupportRole,
} from "@/features/support/types/support.types";

interface SupportConversationProps {
  conversationId: string;

  currentUser: {
    id: string;
    name: string;
    role: SupportRole;
  };

  showAdminControls?: boolean;
}

/**
 * Support conversation placeholder.
 *
 * The repository currently has no persisted Support conversation API contract.
 * This component intentionally does not create or read local seeded conversations.
 */
export function SupportConversation({
  conversationId,
  currentUser,
  showAdminControls = false,
}: SupportConversationProps) {
  void conversationId;
  void currentUser;

  return (
    <section className="rounded-2xl border border-neutral-200 bg-surface p-6 shadow-raised sm:p-8">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-info-surface text-brand">
          <Headphones className="h-5 w-5" aria-hidden="true" />
        </div>

        <div className="min-w-0">
          <p className="text-label font-medium uppercase tracking-[0.14em] text-brand">
            ALI STORE support
          </p>
          <h2 className="mt-2 text-h2 font-bold tracking-tight text-foreground">
            المحادثة المباشرة غير متصلة حاليًا
          </h2>
          <p className="mt-2 max-w-2xl text-body-sm leading-7 text-muted-foreground">
            لا يوجد عقد Backend محفوظ للمحادثات يمكن للواجهة الاعتماد عليه حاليًا.
            لذلك لا يتم إنشاء رسائل أو حالات محلية وهمية، ولا يتم عرض بيانات دعم مزروعة.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck
            className="mt-0.5 h-5 w-5 shrink-0 text-amber-700"
            aria-hidden="true"
          />
          <div>
            <h3 className="text-body-sm font-bold text-amber-900">
              المسار الآمن الحالي
            </h3>
            <p className="mt-1 text-caption leading-5 text-amber-800">
              {showAdminControls
                ? "إجراءات إدارة المحادثة ستظهر فقط بعد توفير endpoint حقيقي للمحادثات وصلاحياته."
                : "يمكن متابعة الطلب أو العنوان أو الدفع من الصفحات المرتبطة بالبيانات الفعلية."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
