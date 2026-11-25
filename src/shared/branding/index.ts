/**
 * Centralized Typed Branding Configuration — 1MS Studio (1RS v1.2)
 * Only verified values are populated. Synchronized across Main, Preload, Renderer, About, and Packaging.
 */

export type ReleaseChannel = 'stable' | 'beta' | 'alpha';

export interface BrandingConfig {
  readonly productName: string;
  readonly shortName: string;
  readonly appId: string;
  readonly developer: string;
  readonly version: string;
  readonly buildNumber: string;
  readonly releaseChannel: ReleaseChannel;
  readonly designStandard: string;
  readonly designStandardSubtitle: string;
  readonly brandAccent: string;
  readonly brandAccentLight: string;
  readonly brandFont: string;
  readonly copyright: string;
  readonly license: string;
  readonly repositoryUrl: string;
  readonly releasesUrl: string;
  readonly supportUrl: string;
  readonly websiteUrl: string;
  readonly officialMuseUrl: string;
  readonly officialMusePortalUrl: string;
  readonly unofficialDisclaimerEn: string;
  readonly unofficialDisclaimerVi: string;
}

export const BRANDING: BrandingConfig = {
  productName: 'Muse for Windows',
  shortName: 'Muse',
  appId: 'com.1msstudio.museforwindows',
  developer: '1MS Studio',
  version: '1.0.0',
  buildNumber: '2026.11.25.100',
  releaseChannel: 'stable',
  designStandard: '1RS v1.2',
  designStandardSubtitle: 'Muse macOS-inspired Desktop Design System for Windows',
  brandAccent: '#FAFF69',
  brandAccentLight: '#C7CE32',
  brandFont: 'Play',
  copyright: 'Copyright © 2026 1MS Studio',
  license: 'MIT License',
  repositoryUrl: 'https://github.com/leminhhuy113/muse-for-windows',
  releasesUrl: 'https://github.com/leminhhuy113/muse-for-windows/releases',
  supportUrl: 'https://github.com/leminhhuy113/muse-for-windows/issues',
  websiteUrl: 'https://github.com/leminhhuy113/muse-for-windows',
  officialMuseUrl: 'https://muse.ai',
  officialMusePortalUrl: 'https://ai.meta.com/muse',
  unofficialDisclaimerEn:
    'Muse for Windows is an independent open-source project developed by 1MS Studio. It is not affiliated with, endorsed by, or sponsored by the original Muse service provider. All third-party trademarks and service names belong to their respective owners.',
  unofficialDisclaimerVi:
    'Muse for Windows là dự án mã nguồn mở độc lập được phát triển bởi 1MS Studio. Ứng dụng không liên kết, không được chứng thực và không được tài trợ bởi nhà cung cấp dịch vụ Muse gốc. Mọi nhãn hiệu và tên dịch vụ bên thứ ba thuộc quyền sở hữu của chủ sở hữu tương ứng.',
} as const;
