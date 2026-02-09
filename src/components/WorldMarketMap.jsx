import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import worldSimpleGeoJson from '../data/world-simple.json';
import './WorldMarketMap.css';

/**
 * 世界地图行情组件
 * 使用 ECharts 实现专业的世界地图行情展示
 */

// 行情数据（移到组件外部，避免重复创建）
const MARKET_DATA = [
    // 欧洲
    { name: '富时100', value: -0.86, coords: [-0.1278, 51.5074], city: 'London' },
    { name: '法国CAC', value: -1.53, coords: [2.3522, 48.8566], city: 'Paris' },
    { name: '德国DAX', value: -1.50, coords: [8.6821, 50.1109], city: 'Frankfurt' },
    { name: '意大利MIB', value: -1.74, coords: [9.1900, 45.4642], city: 'Milan' },
    
    // 亚洲
    { name: '北证50', value: 3.30, coords: [116.4074, 39.9042], city: 'Beijing' },
    { name: '日经225', value: -1.01, coords: [139.6503, 35.6762], city: 'Tokyo' },
    { name: '上证指数', value: 0.17, coords: [121.4737, 31.2304], city: 'Shanghai' },
    { name: '深证成指', value: -2.70, coords: [114.0579, 22.5431], city: 'Shenzhen' },
    { name: '恒生指数', value: -1.73, coords: [114.1694, 22.3193], city: 'Hong Kong' },
    { name: '马来西亚', value: -0.46, coords: [101.6869, 3.1390], city: 'Kuala Lumpur' },
    
    // 北美
    { name: '道琼斯', value: -1.90, coords: [-74.0060, 40.7128], city: 'New York' },
    { name: '纳斯达克', value: -3.56, coords: [-74.0060, 40.7128], city: 'New York' },
    { name: '标普500', value: -2.71, coords: [-74.0060, 40.7128], city: 'New York' },
];

function WorldMarketMap() {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // 初始化 ECharts 实例
    chartInstance.current = echarts.init(chartRef.current);

    // 加载缩略版世界地图
    const loadWorldMap = () => {
      try {
        // 使用本地简化的 GeoJSON 数据（缩略版世界地图）
        echarts.registerMap('world', worldSimpleGeoJson);
        initChart();
      } catch (error) {
        console.error('加载地图数据失败:', error);
        // 降级方案：使用散点图模式
        initChartWithScatter();
      }
    };

    // 使用地图的完整方案
    const initChart = () => {
      const option = {
        backgroundColor: '#e8e8e8',
        title: {
          text: '全球股市行情',
          left: 'center',
          top: 20,
          textStyle: {
            color: '#1976d2',
            fontSize: 24,
            fontWeight: 'bold'
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: function(params) {
            if (params.seriesType === 'scatter') {
              return `
                <div style="padding: 8px;">
                  <div style="font-weight: bold; margin-bottom: 4px;">${params.data[2]}</div>
                  <div style="color: ${params.data[3] >= 0 ? '#ff4444' : '#44ff44'};">
                    ${params.data[3] >= 0 ? '+' : ''}${params.data[3].toFixed(2)}%
                  </div>
                </div>
              `;
            }
            return params.name;
          }
        },
        geo: {
          map: 'world',
          roam: true,
          zoom: 1.2,
          layoutCenter: ['50%', '50%'],
          layoutSize: '90%',
          itemStyle: {
            areaColor: '#d0d0d0',
            borderColor: '#999',
            borderWidth: 1
          },
          emphasis: {
            itemStyle: {
              areaColor: '#c0c0c0',
              borderColor: '#666',
              borderWidth: 2
            }
          },
          label: {
            show: true,
            fontSize: 12,
            color: '#666'
          }
        },
        series: [
          {
            name: '股市行情',
            type: 'scatter',
            coordinateSystem: 'geo',
            data: MARKET_DATA.map(item => [
              item.coords[0], // 经度
              item.coords[1], // 纬度
              item.name,      // 指数名称
              item.value,     // 涨跌幅
              item.city       // 城市
            ]),
            symbolSize: function(val) {
              return Math.abs(val[3]) * 8 + 30; // 根据涨跌幅调整大小
            },
            itemStyle: {
              color: function(params) {
                return params.data[3] >= 0 ? '#ff4444' : '#44ff44';
              },
              shadowBlur: 10,
              shadowColor: function(params) {
                return params.data[3] >= 0 ? 'rgba(255, 68, 68, 0.5)' : 'rgba(68, 255, 68, 0.5)';
              }
            },
            label: {
              show: true,
              formatter: function(params) {
                return `${params.data[2]}\n${params.data[3] >= 0 ? '+' : ''}${params.data[3].toFixed(2)}%`;
              },
              position: 'top',
              fontSize: 12,
              fontWeight: 'bold',
              color: '#fff',
              textBorderColor: '#000',
              textBorderWidth: 1
            },
            emphasis: {
              scale: true,
              label: {
                fontSize: 14
              }
            }
          }
        ],
        legend: {
          data: ['上涨', '下跌'],
          bottom: 20,
          left: 'center',
          itemGap: 30,
          textStyle: {
            fontSize: 14
          }
        }
      };

      chartInstance.current.setOption(option);
    };

    // 降级方案：不使用地图，只用散点图
    const initChartWithScatter = () => {
      const option = {
        backgroundColor: '#e8e8e8',
        title: {
          text: '全球股市行情',
          left: 'center',
          top: 20,
          textStyle: {
            color: '#1976d2',
            fontSize: 24,
            fontWeight: 'bold'
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: function(params) {
            return `
              <div style="padding: 8px;">
                <div style="font-weight: bold; margin-bottom: 4px;">${params.data[2]}</div>
                <div style="color: ${params.data[3] >= 0 ? '#ff4444' : '#44ff44'};">
                  ${params.data[3] >= 0 ? '+' : ''}${params.data[3].toFixed(2)}%
                </div>
                <div style="font-size: 12px; color: #666; margin-top: 4px;">${params.data[4]}</div>
              </div>
            `;
          }
        },
        xAxis: {
          type: 'value',
          name: '经度',
          min: -180,
          max: 180,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { show: false },
          splitLine: { show: false }
        },
        yAxis: {
          type: 'value',
          name: '纬度',
          min: -90,
          max: 90,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { show: false },
          splitLine: { show: false }
        },
        series: [
          {
            name: '股市行情',
            type: 'scatter',
            data: MARKET_DATA.map(item => [
              item.coords[0], // 经度
              item.coords[1], // 纬度
              item.name,      // 指数名称
              item.value,     // 涨跌幅
              item.city       // 城市
            ]),
            symbolSize: function(val) {
              return Math.abs(val[3]) * 8 + 30;
            },
            itemStyle: {
              color: function(params) {
                return params.data[3] >= 0 ? '#ff4444' : '#44ff44';
              },
              shadowBlur: 10,
              shadowColor: function(params) {
                return params.data[3] >= 0 ? 'rgba(255, 68, 68, 0.5)' : 'rgba(68, 255, 68, 0.5)';
              }
            },
            label: {
              show: true,
              formatter: function(params) {
                return `${params.data[2]}\n${params.data[3] >= 0 ? '+' : ''}${params.data[3].toFixed(2)}%`;
              },
              position: 'top',
              fontSize: 12,
              fontWeight: 'bold',
              color: '#fff',
              textBorderColor: '#000',
              textBorderWidth: 1
            },
            emphasis: {
              scale: true,
              label: {
                fontSize: 14
              }
            }
          }
        ],
        legend: {
          data: ['上涨', '下跌'],
          bottom: 20,
          left: 'center',
          itemGap: 30,
          textStyle: {
            fontSize: 14
          }
        }
      };

      chartInstance.current.setOption(option);
    };

    loadWorldMap();

    // 响应式调整
    const handleResize = () => {
      chartInstance.current?.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.current?.dispose();
    };
  }, []);

  return (
    <div className="world-market-map-container">
      <div ref={chartRef} className="world-market-chart" />
    </div>
  );
}

export default WorldMarketMap;
