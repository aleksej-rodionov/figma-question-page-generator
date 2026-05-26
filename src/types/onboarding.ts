export type OnboardingSelectionScreen = {
  pageKey: string;
  preTitle?: string;
  title: string;
  description?: string;
  mode: "singleSelect" | "multiselect";
  items: OnboardingAnswerItem[];
};

export type OnboardingAnswerItem = {
  value: string;
  emoji?: string;
  title: string;
  description?: string;
  label?: string;
};
