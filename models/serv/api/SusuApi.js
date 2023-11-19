/**
 * 苏苏的荣耀助手API Honor-plugin 封装
 * 静态接口: https://pvp.91m.top/hero/v1/app/public
 * 动态接口: https://pvp.91m.top/hero/v1
 */

import _ from "lodash";
import { Data } from "#honor";

export default {
  id: "susu",
  name: "Susu",
  cfgKey: "susuApi",

  // Parse service response
  async response(data, req) {
    if (!data.heroInfo) {
      if (data.error) {
        console.log(`Susu ReqErr: ${data.error}`);
      }
    }

    let heroInfo = data.heroInfo || {};
    if (!heroInfo || Object.keys(heroInfo).length) {
      console.log(`Susu ReqErr: heroInfo dict empty`);
    }

    return data;
  },

  updateHero(hero, data) {
    // TODO: Update hero aliases and other data
    hero.setBasicData(
      Data.getData(
        data.heroInfo,
        "banRate,pickRate,bpRate,winRate,score,behavior,highLight,feature,skill,skin,type,dominanceRate,equipmentMoney,equipmentMoneyMin,id,img,likeStatus,name,nickName:cName,gradient,title,label,adjustmentTime,updateTime,change"
      )
    );
  },
};
