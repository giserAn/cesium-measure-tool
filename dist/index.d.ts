import * as Cesium from 'cesium';
/**
 * 测量工具分类
 */
export declare enum MeasureType {
    /**
     * 距离测量
     */
    Distance = "distance",
    /**
     * 面积测量
     */
    Area = "area"
}
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
    polylineStyle?: Cesium.PolylineGraphics | Cesium.PolylineGraphics.ConstructorOptions;
    /**
     * 绘制面的样式
     */
    polygonStyle?: Cesium.PolygonGraphics | Cesium.PolygonGraphics.ConstructorOptions;
    /**
     * 绘制label的样式
     */
    labelStyle?: Cesium.LabelGraphics | Cesium.LabelGraphics.ConstructorOptions;
    /**
     * 监听绘制完成事件
     */
    onDrawEnd?: (arg0: MeasureType, positions: Cesium.Cartesian3[]) => void;
};
export default class MeasureTool {
    private viewer;
    private options;
    private measureType;
    private dataSource;
    private _mousePos;
    private tempPositions;
    private handler;
    /**
     * constructor(viewer: Cesium.Viewer,options?: PolygonGraphics.ConstructorOptions);
     * @param viewer
     * @param options
     */
    constructor(viewer: Cesium.Viewer, options?: Options);
    /**
     * 激活工具
     * @param measureType 测量类型
     */
    activate(measureType: MeasureType): void;
    /**
     * 取消激活工具
     */
    deactivate(): void;
    /**
     * 清除所有
     */
    clearAll(): void;
    private registerEvents;
    private unRegisterEvents;
    private drawEnd;
    private leftClickEvent;
    private mouseMoveEvent;
    private rightClickEvent;
    private drawStart2InitEntity;
    private refreshEntityLabel;
    private addMeasureDistanceEntity;
    private addMeasureAreaEntity;
    private addMeasureDistanceEntityLabel;
    private addMeasureAreaEntityLabel;
    private addLabel;
}
