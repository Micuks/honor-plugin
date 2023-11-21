import _ from "lodash";

let Format = {
  pct: function (num, fix = 1) {
    return (num * 1).toFixed(fix) + "%";
  },
  percent: function (num, fix = 1) {
    return Format.pct(num * 100, fix);
  },
};

export default Format;
