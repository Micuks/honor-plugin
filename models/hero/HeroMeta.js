import _ from "lodash";
import { Format } from "#honor";

export const baseAttrName = {
  nickName: "别名",
  gradient: "梯度",
  title: "称号",
  label: "标签",
  dominanceRate: "掌控率",
  equipmentMoney: "出装金额",
  equipmentMoneyMin: "最小出装金额",
  img: "英雄图片",
  updateTime: "更新时间",
  adjustmentTime: "最后调整时间",
};
export const listAttrName = {
  banRate: "ban率",
  pickRate: "选取率",
  bpRate: "BP率",
  winRate: "胜率",
  score: "热度评分",
  behavior: "表现",
  highlight: "高光",
  skill: "常用技能",
  skin: "皮肤",
  type: "类别",
};

export const dictAttrName = {
  feature: "期望表现",
};

const HeroMeta = {
  getAttrList(base, list, dict) {
    let ret = [];
    _.forEach(base, (v, k) => {
      ret.push({
        title: baseAttrName[k],
        value: Format.pct(v),
      });
      _.forEach(list, (v, k) => {
        ret.push({
          title: listAttrName[k],
          value: [].push(_.forEach()),
        });
      });
    });

    ret.push;
  },
};

export default HeroMeta;
