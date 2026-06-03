/**
 * 批量添加100个中国公共政策市场到 Supabase
 * 使用方法: node scripts/add-markets.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 读取环境变量
const envPath = path.join(__dirname, '..', '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('❌ 找不到 .env.local 文件，请先配置数据库连接');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return;
  const [key, ...valueParts] = trimmed.split('=');
  if (key && valueParts.length > 0) {
    env[key.trim()] = valueParts.join('=').trim();
  }
});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// 定义所有100个市场数据
const allMarkets = [
  // 经济政策类 (1-20)
  { title: '2027年中国GDP增速将超过5%', description: '根据国家统计局数据，2027年全年GDP实际增速是否超过5%', category: '经济政策', end_date: '2027-12-31T23:59:59+08:00' },
  { title: '2026年底人民币兑美元汇率将低于6.5', description: '2026年12月31日人民币兑美元中间价是否低于6.5', category: '经济政策', end_date: '2026-12-31T23:59:59+08:00' },
  { title: '2027年推出全国性房地产税', description: '2027年底前是否会在全国范围内正式开征房地产税', category: '经济政策', end_date: '2027-12-31T23:59:59+08:00' },
  { title: '2026年新能源汽车渗透率超过50%', description: '2026年全年新能源汽车销量占乘用车总销量比例是否超过50%', category: '经济政策', end_date: '2026-12-31T23:59:59+08:00' },
  { title: '2027年个人所得税起征点上调至8000元', description: '2027年底前个税起征点是否上调至8000元/月或更高', category: '经济政策', end_date: '2027-12-31T23:59:59+08:00' },
  { title: '2026年发行超长期特别国债规模超2万亿', description: '2026年全年超长期特别国债发行总规模是否超过2万亿元', category: '经济政策', end_date: '2026-12-31T23:59:59+08:00' },
  { title: '2027年全面取消城市落户限制', description: '2027年底前是否在所有城市取消落户积分和学历限制', category: '经济政策', end_date: '2027-12-31T23:59:59+08:00' },
  { title: '2026年推出做空A股股指期权产品', description: '2026年是否推出沪深300或上证50的看跌期权产品', category: '经济政策', end_date: '2026-12-31T23:59:59+08:00' },
  { title: '2027年电商平台实施"仅退款"制度标准化', description: '国家层面是否出台统一的"仅退款"规范标准', category: '经济政策', end_date: '2027-12-31T23:59:59+08:00' },
  { title: '2026年碳交易市场扩展至八大行业', description: '全国碳市场是否扩展到钢铁、建材等8个以上行业', category: '经济政策', end_date: '2026-12-31T23:59:59+08:00' },
  { title: '2027年数字人民币日均交易规模超100亿', description: '数字人民币单日平均交易额是否突破100亿元', category: '经济政策', end_date: '2027-12-31T23:59:59+08:00' },
  { title: '2026年出台平台经济反垄断指南修订版', description: '是否发布新版互联网平台反垄断指南', category: '经济政策', end_date: '2026-12-31T23:59:59+08:00' },
  { title: '2027年股票发行全面实行注册制', description: '包括主板在内的所有板块是否全部实施注册制', category: '经济政策', end_date: '2027-12-31T23:59:59+08:00' },
  { title: '2026年养老金全国统筹正式实施', description: '企业职工基本养老保险是否实现全国统收统支', category: '经济政策', end_date: '2026-12-31T23:59:59+08:00' },
  { title: '2027年消费税改革启动', description: '是否将部分消费税征收环节后移至零售环节', category: '经济政策', end_date: '2027-12-31T23:59:59+08:00' },
  { title: '2026年推出REITs试点扩容至保障房', description: '公募REITs是否纳入保障性租赁住房资产', category: '经济政策', end_date: '2026-12-31T23:59:59+08:00' },
  { title: '2027年跨境电商进口税收政策收紧', description: '跨境电商零售进口商品是否提高税率或降低免税额度', category: '经济政策', end_date: '2027-12-31T23:59:59+08:00' },
  { title: '2026年发布AI产业专项支持政策', description: '国家层面是否出台人工智能产业专项扶持政策', category: '经济政策', end_date: '2026-12-31T23:59:59+08:00' },
  { title: '2027年农村宅基地可跨集体交易试点', description: '是否在部分地区允许宅基地使用权跨集体经济组织流转', category: '经济政策', end_date: '2027-12-31T23:59:59+08:00' },
  { title: '2026年出台灵活就业社保优惠政策', description: '是否大幅降低灵活就业人员社保缴费比例', category: '经济政策', end_date: '2026-12-31T23:59:59+08:00' },
  
  // 科技创新类 (21-35)
  { title: '2027年中国发射载人月球探测器', description: '是否成功发射载人登月任务', category: '科技创新', end_date: '2027-12-31T23:59:59+08:00' },
  { title: '2026年6G技术标准正式发布', description: 'ITU是否发布6G国际标准，中国主导提案占比超30%', category: '科技创新', end_date: '2026-12-31T23:59:59+08:00' },
  { title: '2027年量子计算机实用化突破', description: '是否有中国量子计算机解决实际商业问题案例', category: '科技创新', end_date: '2027-12-31T23:59:59+08:00' },
  { title: '2026年国产光刻机实现7nm制程', description: '中国自主研发光刻机是否实现7nm工艺', category: '科技创新', end_date: '2026-12-31T23:59:59+08:00' },
  { title: '2027年AI大模型参数规模超10万亿', description: '中国是否发布参数量超过10万亿的大语言模型', category: '科技创新', end_date: '2027-12-31T23:59:59+08:00' },
  { title: '2026年脑机接口临床试验获批', description: '是否有国产脑机接口设备获NMPA批准开展临床试验', category: '科技创新', end_date: '2026-12-31T23:59:59+08:00' },
  { title: '2027年商用无人驾驶出租车规模运营', description: '是否有城市实现Robotaxi全域无人商业化运营', category: '科技创新', end_date: '2027-12-31T23:59:59+08:00' },
  { title: '2026年可控核聚变实验取得突破', description: '中国核聚变装置是否实现能量增益大于1', category: '科技创新', end_date: '2027-12-31T23:59:59+08:00' },
  { title: '2027年国产商用大飞机C919交付超200架', description: 'C919累计交付数量是否超过200架', category: '科技创新', end_date: '2027-12-31T23:59:59+08:00' },
  { title: '2026年深海万米载人潜水器投入使用', description: '是否有载人潜水器完成万米深海科考任务', category: '科技创新', end_date: '2026-12-31T23:59:59+08:00' },
  { title: '2027年推出生成式AI监管专项法规', description: '是否出台针对AIGC的专门法律法规', category: '科技创新', end_date: '2027-12-31T23:59:59+08:00' },
  { title: '2026年基因编辑疗法获批上市', description: '中国是否批准首个基因编辑治疗药物', category: '科技创新', end_date: '2026-12-31T23:59:59+08:00' },
  { title: '2027年建成国家一体化算力网', description: '全国算力网络是否实现东数西算全链路贯通', category: '科技创新', end_date: '2027-12-31T23:59:59+08:00' },
  { title: '2026年卫星互联网商用服务开通', description: '是否有低轨卫星互联网面向公众提供商业服务', category: '科技创新', end_date: '2026-12-31T23:59:59+08:00' },
  { title: '2027年人形机器人进入家庭服务试点', description: '是否有人形机器人在100户以上家庭开展服务试点', category: '科技创新', end_date: '2027-12-31T23:59:59+08:00' },

  // 教育政策类 (36-50)
  { title: '2027年高考取消英语必考科目', description: '高考是否将英语改为选考或降低分值至100分以下', category: '教育政策', end_date: '2027-12-31T23:59:59+08:00' },
  { title: '2026年义务教育延长至12年', description: '是否将高中纳入义务教育范围', category: '教育政策', end_date: '2026-12-31T23:59:59+08:00' },
  { title: '2027年大学学费涨幅超过30%', description: '公立大学平均学费相比2024年涨幅是否超30%', category: '教育政策', end_date: '2027-12-31T23:59:59+08:00' },
  { title: '2026年全面取消校外学科培训机构', description: '是否禁止所有学科类校外培训', category: '教育政策', end_date: '2026-12-31T23:59:59+08:00' },
  { title: '2027年推行大学生创业休学制度', description: '是否允许大学生休学创业并保留学籍3年以上', category: '教育政策', end_date: '2027-12-31T23:59:59+08:00' },
  { title: '2026年中小学全面普及人工智能课程', description: 'AI编程是否成为中小学必修课', category: '教育政策', end_date: '2026-12-31T23:59:59+08:00' },
  { title: '2027年研究生招生规模扩大20%', description: '硕士研究生年度招生人数相比2024年增长是否超20%', category: '教育政策', end_date: '2027-12-31T23:59:59+08:00' },
  { title: '2026年教师工资不低于公务员全面落实', description: '所有地区教师平均工资是否达到公务员水平', category: '教育政策', end_date: '2027-12-31T23:59:59+08:00' },
  { title: '2027年高职院校升格本科比例超30%', description: '职业本科院校数量是否超过职业专科的30%', category: '教育政策', end_date: '2027-12-31T23:59:59+08:00' },
  { title: '2026年推行弹性学制和学分制改革', description: '是否允许本科生3-6年弹性毕业', category: '教育政策', end_date: '2027-12-31T23:59:59+08:00' },
  { title: '2027年艺术类高考改革取消校考', description: '是否统一使用省级统考成绩录取', category: '教育政策', end_date: '2027-12-31T23:59:59+08:00' },
  { title: '2026年乡村教师补贴标准翻倍', description: '乡村教师生活补助是否提高至平均2000元/月以上', category: '教育政策', end_date: '2026-12-31T23:59:59+08:00' },
  { title: '2027年博士生基本学制缩短至3年', description: '是否将博士培养基本学制从4年缩短至3年', category: '教育政策', end_date: '2027-12-31T23:59:59+08:00' },
  { title: '2026年中小学实行教师轮岗制度', description: '是否在全国范围推行公办校教师定期轮岗', category: '教育政策', end_date: '2026-12-31T23:59:59+08:00' },
  { title: '2027年民办学校转公办比例超50%', description: '义务教育阶段民办学校是否超半数转为公办或政府收购', category: '教育政策', end_date: '2027-12-31T23:59:59+08:00' },

  // 医疗健康类 (51-65)
  { title: '2027年全国医保个人账户可家庭共济', description: '是否所有省份实现医保个人账户家庭成员共享', category: '医疗健康', end_date: '2027-12-31T23:59:59+08:00' },
  { title: '2026年互联网医疗纳入医保支付', description: '线上诊疗费用是否可直接医保结算', category: '医疗健康', end_date: '2026-12-31T23:59:59+08:00' },
  { title: '2027年罕见病药品纳入医保目录超100种', description: '医保目录中罕见病用药数量是否超过100种', category: '医疗健康', end_date: '2027-12-31T23:59:59+08:00' },
  { title: '2026年社区医院全面配备全科医生', description: '城市社区卫生服务中心是否全部配备5名以上全科医生', category: '医疗健康', end_date: '2026-12-31T23:59:59+08:00' },
  { title: '2027年推行长期护理保险全国统筹', description: '长护险是否在全国范围统一实施', category: '医疗健康', end_date: '2027-12-31T23:59:59+08:00' },
  { title: '2026年辅助生殖技术纳入医保', description: '试管婴儿等辅助生殖费用是否进入医保报销范围', category: '医疗健康', end_date: '2026-12-31T23:59:59+08:00' },
  { title: '2027年公立医院取消药品加成全覆盖', description: '所有公立医疗机构是否实现零差率销售药品', category: '医疗健康', end_date: '2027-12-31T23:59:59+08:00' },
  { title: '2026年远程医疗覆盖所有县级医院', description: '县级医院是否全部接入远程会诊平台', category: '医疗健康', end_date: '2026-12-31T23:59:59+08:00' },
  { title: '2027年推出国家级健康码互通标准', description: '是否建立全国统一的电子健康档案和就诊信息共享平台', category: '医疗健康', end_date: '2027-12-31T23:59:59+08:00' },
  { title: '2026年医师多点执业全面放开', description: '是否取消医生多点执业审批限制', category: '医疗健康', end_date: '2026-12-31T23:59:59+08:00' },
  { title: '2027年中医药产业产值突破3万亿', description: '中医药全产业链年产值是否超过3万亿元', category: '医疗健康', end_date: '2027-12-31T23:59:59+08:00' },
  { title: '2026年DRG付费方式覆盖全国', description: '住院费用DRG/DIP支付方式是否在所有统筹区实施', category: '医疗健康', end_date: '2026-12-31T23:59:59+08:00' },
  { title: '2027年儿科医生数量增长50%', description: '相比2024年儿科执业医师数量增幅是否超50%', category: '医疗健康', end_date: '2027-12-31T23:59:59+08:00' },
  { title: '2026年器官捐献志愿登记人数破5000万', description: '中国人体器官捐献志愿登记人数是否突破5000万', category: '医疗健康', end_date: '2026-12-31T23:59:59+08:00' },
  { title: '2027年医疗美容行业专项整治', description: '是否出台医美行业国家标准和严格准入制度', category: '医疗健康', end_date: '2027-12-31T23:59:59+08:00' },

  // 环境能源类 (66-80)
  { title: '2027年碳达峰目标提前实现', description: '中国碳排放是否在2027年前达到峰值', category: '环境保护', end_date: '2027-12-31T23:59:59+08:00' },
  { title: '2026年可再生能源装机容量超煤电', description: '风电光伏等可再生能源装机是否超过煤电', category: '环境保护', end_date: '2026-12-31T23:59:59+08:00' },
  { title: '2027年全国碳排放权交易市场扩容', description: '碳市场年交易额是否突破1000亿元', category: '环境保护', end_date: '2027-12-31T23:59:59+08:00' },
  { title: '2026年实施全国性塑料污染治理条例', description: '是否出台国家层面禁塑限塑法规', category: '环境保护', end_date: '2026-12-31T23:59:59+08:00' },
  { title: '2027年新建建筑全面执行绿色标准', description: '城镇新建建筑中绿色建筑占比是否达100%', category: '环境保护', end_date: '2027-12-31T23:59:59+08:00' },
  { title: '2026年长江十年禁渔中期评估通过', description: '长江流域水生生物资源是否显著恢复', category: '环境保护', end_date: '2026-12-31T23:59:59+08:00' },
  { title: '2027年核电装机容量突破1亿千瓦', description: '在运核电机组总装机容量是否超过100GW', category: '环境保护', end_date: '2027-12-31T23:59:59+08:00' },
  { title: '2026年垃圾分类全国强制实施', description: '所有地级市是否立法强制垃圾分类', category: '环境保护', end_date: '2026-12-31T23:59:59+08:00' },
  { title: '2027年空气质量优良天数比例超90%', description: '全国地级及以上城市PM2.5优良天数比例是否超90%', category: '环境保护', end_date: '2027-12-31T23:59:59+08:00' },
  { title: '2026年电动汽车换电站超10万座', description: '全国换电站数量是否突破10万座', category: '环境保护', end_date: '2026-12-31T23:59:59+08:00' },
  { title: '2027年水资源税改革全国推广', description: '是否在所有省份实施水资源税', category: '环境保护', end_date: '2027-12-31T23:59:59+08:00' },
  { title: '2026年海洋保护区面积达到管辖海域15%', description: '中国管辖海域保护区占比是否达15%', category: '环境保护', end_date: '2026-12-31T23:59:59+08:00' },
  { title: '2027年新能源汽车电池回收体系建立', description: '是否建立全国统一的动力电池回收利用网络', category: '环境保护', end_date: '2027-12-31T23:59:59+08:00' },
  { title: '2026年绿色金融标准与国际接轨', description: '中国绿色金融标准是否与欧盟分类法基本兼容', category: '环境保护', end_date: '2026-12-31T23:59:59+08:00' },
  { title: '2027年湿地保护率达到60%', description: '全国湿地保护率是否达到60%以上', category: '环境保护', end_date: '2027-12-31T23:59:59+08:00' },

  // 社会治理类 (81-95)
  { title: '2027年推出个人破产制度全国版', description: '个人破产法是否在全国范围实施', category: '社会政策', end_date: '2027-12-31T23:59:59+08:00' },
  { title: '2026年延迟退休政策正式实施', description: '是否开始执行渐进式延迟法定退休年龄', category: '社会政策', end_date: '2026-12-31T23:59:59+08:00' },
  { title: '2027年三孩家庭享受税收减免', description: '是否对三孩家庭实施个税专项附加扣除', category: '社会政策', end_date: '2027-12-31T23:59:59+08:00' },
  { title: '2026年农民工随迁子女异地高考全放开', description: '是否取消所有省份的异地高考户籍限制', category: '社会政策', end_date: '2026-12-31T23:59:59+08:00' },
  { title: '2027年试点四天工作制', description: '是否有城市或行业开展每周四天工作制试点', category: '社会政策', end_date: '2027-12-31T23:59:59+08:00' },
  { title: '2026年最低工资标准大幅上调', description: '全国最低工资平均水平是否上涨25%以上', category: '社会政策', end_date: '2026-12-31T23:59:59+08:00' },
  { title: '2027年推出统一的住房公积金制度改革', description: '是否建立全国住房公积金转移接续平台', category: '社会政策', end_date: '2027-12-31T23:59:59+08:00' },
  { title: '2026年建立育儿补贴制度', description: '是否设立国家层面的生育津贴或育儿补贴', category: '社会政策', end_date: '2026-12-31T23:59:59+08:00' },
  { title: '2027年人口出生率回升至10‰以上', description: '年度人口出生率是否超过10‰', category: '社会政策', end_date: '2027-12-31T23:59:59+08:00' },
  { title: '2026年老年人数字鸿沟治理见效', description: '是否出台老年人智能技术应用适老化强制标准', category: '社会政策', end_date: '2026-12-31T23:59:59+08:00' },
  { title: '2027年快递外卖员纳入工伤保险', description: '新业态从业人员是否强制参加工伤保险', category: '社会政策', end_date: '2027-12-31T23:59:59+08:00' },
  { title: '2026年推出遗产税草案', description: '是否公布遗产税或赠与税立法草案', category: '社会政策', end_date: '2026-12-31T23:59:59+08:00' },
  { title: '2027年居民可支配收入倍增计划启动', description: '是否提出2035年居民收入翻番的具体路线图', category: '社会政策', end_date: '2027-12-31T23:59:59+08:00' },
  { title: '2026年全面推行带薪护理假', description: '是否立法要求独生子女享有护理假', category: '社会政策', end_date: '2026-12-31T23:59:59+08:00' },
  { title: '2027年社会信用体系立法', description: '是否颁布《社会信用法》规范信用信息管理', category: '社会政策', end_date: '2027-12-31T23:59:59+08:00' },

  // 文化数字类 (96-100)
  { title: '2027年游戏版号审批效率提升50%', description: '年度游戏版号发放数量是否较2024年增加50%以上', category: '文化政策', end_date: '2027-12-31T23:59:59+08:00' },
  { title: '2026年短视频平台实行实名认证', description: '是否强制要求短视频博主实名制并显示IP属地', category: '文化政策', end_date: '2026-12-31T23:59:59+08:00' },
  { title: '2027年国产电影票房占比超70%', description: '年度国产影片票房占比是否超过70%', category: '文化政策', end_date: '2027-12-31T23:59:59+08:00' },
  { title: '2026年数据出境安全评估简化', description: '个人信息出境标准合同备案是否改为备案制', category: '数据安全', end_date: '2026-12-31T23:59:59+08:00' },
  { title: '2027年建立统一数字身份认证体系', description: '是否推出全国通用的数字身份eID', category: '数据安全', end_date: '2027-12-31T23:59:59+08:00' },
];

async function main() {
  console.log('🚀 开始添加市场数据到Supabase...\n');
  console.log(`准备插入 ${allMarkets.length} 个市场\n`);
  
  const { data, error } = await supabase
    .from('markets')
    .insert(allMarkets)
    .select();

  if (error) {
    console.error('❌ 插入失败:', error.message);
    console.error(error);
    process.exit(1);
  }

  console.log(`✅ 成功添加 ${data.length} 个市场！\n`);
  
  const categories = {};
  data.forEach(m => {
    categories[m.category] = (categories[m.category] || 0) + 1;
  });
  
  console.log('📊 按类别统计:');
  Object.entries(categories).forEach(([cat, count]) => {
    console.log(`  ${cat}: ${count} 个`);
  });
  
  console.log('\n🎉 所有市场数据已成功添加！');
}

main().catch(console.error);
