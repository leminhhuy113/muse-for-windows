const copy = {
  en: ['Weekly quota alerts', 'Get a Windows notification when Muse reaches a threshold after syncing.', 'Warning (%)', 'Critical (%)', 'Save thresholds', 'Enter whole numbers from 1 to 100, with warning below critical.'],
  vi: ['Cảnh báo hạn mức tuần', 'Windows sẽ thông báo khi dữ liệu Muse vừa đồng bộ chạm ngưỡng.', 'Cảnh báo (%)', 'Khẩn cấp (%)', 'Lưu ngưỡng', 'Nhập số nguyên từ 1 đến 100. Ngưỡng cảnh báo phải thấp hơn ngưỡng khẩn cấp.'],
  zh: ['每周用量提醒', '同步后，Muse 用量达到阈值时显示 Windows 通知。', '预警 (%)', '紧急 (%)', '保存阈值', '请输入 1 到 100 的整数，预警值须低于紧急值。'],
  ja: ['週間使用量の通知', '同期後に Muse の使用量がしきい値に達すると Windows に通知します。', '警告 (%)', '緊急 (%)', 'しきい値を保存', '1〜100 の整数を入力し、警告を緊急より低く設定してください。'],
  ko: ['주간 사용량 알림', '동기화 후 Muse 사용량이 기준에 도달하면 Windows 알림을 표시합니다.', '주의 (%)', '위험 (%)', '기준 저장', '1~100 사이의 정수를 입력하고 주의 기준을 위험 기준보다 낮게 설정하세요.'],
} as const;

export function quotaAlertCopy(locale: string) {
  const language = locale.toLowerCase().split('-')[0];
  return copy[language as keyof typeof copy] ?? copy.en;
}
