export const susuApi = {
  name: "susu",
  url: "https://api.91m.top/hero/v1",
  userAgent: "Yunzai-Bot/Honor-Plugin",
  params: {
    dynamicApi: () => {
      return `${url}/app/public`;
    },
    staticApi: () => {
      return `${url}`;
    },
  },
};

export const isSys = true;
