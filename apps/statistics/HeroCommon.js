/**
 * Hero info common methods
 */
import { Hero } from "#honor.models";

export async function getHeroInfoRefresh(e, heroId) {
  let hero = Hero.get(heroId);
  if (!hero) {
    return false;
  }

  let heroInfo = await hero.getInfo();
  if (!heroInfo || !heroInfo.hasData) {
    logger.mark(`本地无英雄${hero.name}信息, 尝试自动请求...`);
    await hero.refresh({ heroInfo: true });
    heroInfo = hero.getInfo();
  }

  if (!heroInfo || !heroInfo.hasData) {
    if (!e._isReplyed) {
      e.reply(`英雄${hero.name}信息获取失败, 请稍后再试`);
    }
    return false;
  }

  return heroInfo;
}
