// Arabic display labels for the canonical category domain — keyed by the
// same slugs the canonical source (features/catalog/data/category-tree.ts,
// accessed via category.service.ts's getTopLevelCategories()) defines. That
// source only stores English `name`/`description` values, and no Arabic
// dictionary existed anywhere in the repository before this file — this is
// a real translation for real, existing categories, not an invented one,
// and not a second competing category source (it carries no ids/children/
// filters of its own).
//
// This is the one shared place any customer-facing consumer of the
// canonical category source (category pages, filters, navigation) can
// reuse instead of re-declaring its own translation. Any category slug not
// listed here has no verified Arabic label yet — consumers should fall
// back to the English `name` rather than guess a translation.
export const CATEGORY_LABEL_AR: Record<string, string> = {
  fashion: "الأزياء",
  accessories: "الإكسسوارات",
  "beauty-care": "الجمال والعناية",

  men: "رجال",
  women: "نساء",
  kids: "أطفال",
};
