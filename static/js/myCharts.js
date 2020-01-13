let data = [
    {xp: 33, language: "Python", date: "2020-01-06"},
    {xp: 41, language: "JSON", date: "2020-01-07"},
    {xp: 770, language: "Python", date: "2020-01-07"},
    {xp: 4, language: "Plain text", date: "2020-01-08"},
    {xp: 2107, language: "Python", date: "2020-01-08"},
    {xp: 42, language: "JavaScript", date: "2020-01-09"},
    {xp: 1639, language: "Python", date: "2020-01-09"},
    {xp: 18, language: "JSON", date: "2020-01-11"},
    {xp: 11, language: "Plain text", date: "2020-01-11"},
    {xp: 6103, language: "Python", date: "2020-01-11"},
    {xp: 3588, language: "Python", date: "2020-01-12"}
];


let languages = Array.from(new Set(data.map(v => v.language)));
let dates = ['2020-01-06', '2020-01-07', '2020-01-08', '2020-01-09', '2020-01-10', '2020-01-11', '2020-01-12'];

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