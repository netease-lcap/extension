import { ThemeConfig } from 'antd';
export const theme: ThemeConfig = {
  token: {
    colorPrimary: '#3377ff',
    colorInfo: '#3377ff',
    colorError: '#f24957',
    colorTextBase: '#1d2129',
    wireframe: true,
    colorBorder: '#e5e6eb',
    borderRadius: 4,
    colorFillSecondary: '#f2f3f5',
    controlHeight: 28,
    colorBgLayout: '#e5e6eb',
    fontSize: 12,
  },
  components: {
    Button: {
      paddingInline: 8,
    },
    Tabs: {
      cardPadding: '5px 8px 6px',
      horizontalItemGutter: 24,
    },
    Modal: {
      borderRadiusSM: 8,
      padding: 12,
    }
  },
};
