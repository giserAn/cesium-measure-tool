## cesium-measure-tool

### 安装

```
npm i cesium-measure-tool
```

### 使用

```
import MeasureTool from "cesium-measure-tool"

const tool = new MeasureTool(viewer, {})

function measure(type) {
    switch (type) {
          case 'distance':
            tool.activate('distance')
            break
          case 'area':
            tool.activate('area')
            break
          case 'clear':
            tool.clearAll()
            break
        }
    }
```

### options

```
/**
 * constructor Options
 */
export type Options = {
    /**
     * 测距离时，是否显示总距离 默认：true
     */
    showAllDistance?: boolean;
    /**
     * 测距离时，显示总距离的位置，图形中间‘center’,绘线末尾‘end’ 默认：'center'
     */
    showAllDistancePosition?: 'center' | 'end';
    /**
     * 绘制线的样式
     */
    polylineStyle?: Cesium.PolylineGraphics ;
    /**
     * 绘制面的样式
     */
    polygonStyle?: Cesium.PolygonGraphics;
    /**
     * 绘制label的样式
     */
    labelStyle?: Cesium.LabelGraphics;
    /**
     * 监听绘制完成事件
     */
    onDrawEnd?: (arg0: MeasureType, positions: Cesium.Cartesian3[]) => void;
};
```
