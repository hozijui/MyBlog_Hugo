let data = [
    {xp: 1463, language: "Python", date: "2019-12-16"},
    {xp: 10, language: "Java", date: "2019-12-16"},
    {xp: 95, language: "Plain text", date: "2019-12-17"},
    {xp: 2998, language: "Python", date: "2019-12-17"},
    {xp: 39, language: "Plain text", date: "2019-12-18"},
    {xp: 3483, language: "Python", date: "2019-12-18"},
    {xp: 105, language: "JSON", date: "2019-12-19"},
    {xp: 1103, language: "Python", date: "2019-12-19"},
    {xp: 177, language: "Java", date: "2019-12-19"},
    {xp: 7, language: "Drools", date: "2019-12-19"},
    {xp: 2, language: "JSON", date: "2019-12-20"},
    {xp: 13, language: "JavaScript", date: "2019-12-20"},
    {xp: 27, language: "Plain text", date: "2019-12-20"},
    {xp: 1682, language: "Python", date: "2019-12-20"},
    {xp: 287, language: "Markdown", date: "2019-12-20"},
    {xp: 25, language: "JSON", date: "2019-12-21"},
    {xp: 26, language: "Plain text", date: "2019-12-21"},
    {xp: 2992, language: "Python", date: "2019-12-21"},
    {xp: 69, language: "JSON", date: "2019-12-22"},
    {xp: 3790, language: "Python", date: "2019-12-22"}
];


let languages = Array.from(new Set(data.map(v => v.language)));
let dates = ['2019-12-16', '2019-12-17', '2019-12-18', '2019-12-19', '2019-12-20', '2019-12-21', '2019-12-22'];

let options = {
    tooltip: {
        trigger: 'axis',
        axisPointer: {type: 'shadow'},
        formatter: (params) => {
            let show_str = `${params[0].axisValue}<br/>`;
            for (let param of params) {
                if (param.data !== 0) {
                    show_str += `${param.marker}${param.seriesName}: ${param.data}<br/>`;
                }
            }
            return show_str;
        }
    },
    legend: {
        left: '2%',
        right: '3%',
        type: 'scroll',
        align: 'left',
        data: languages
    },
    grid: {
        top: '12%',
        left: '3%',
        right: '4%',
        bottom: 0,
        containLabel: true
    },
    xAxis: {
        type: 'category',
        axisLabel: {
            margin: 15
        },
        data: dates
    },
    yAxis: {
        type: 'value'
    },
    series: languages.map(lang => ({
        name: lang,
        type: 'bar',
        stack: 'total',
        data: getValue(lang)
    })),
    color: ["#3e4053", "#F15854", "#5DA5DA", "#FAA43A",
        "#60BD68", "#F17CB0", "#B2912F", "#DECF3F",
        "#B276B2", "#4D4D4D"]
};

function getValue(lang) {
    let list = [];
    dates.forEach(date => {
        let index = data.findIndex(v => v.date === date && v.language === lang);
        list = index >= 0 ? list.concat(data[index].xp) : list.concat(0);
    });
    return list;
}

let myChart = echarts.init(document.querySelector('#code_stats'), 'macarons');
myChart.setOption(options);
window.addEventListener("resize", () => myChart.resize());