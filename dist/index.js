"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeasureType = void 0;
const Cesium = __importStar(require("cesium"));
const utils_1 = require("./utils");
/**
 * 测量工具分类
 */
var MeasureType;
(function (MeasureType) {
    /**
     * 距离测量
     */
    MeasureType["Distance"] = "distance";
    /**
     * 面积测量
     */
    MeasureType["Area"] = "area";
})(MeasureType || (exports.MeasureType = MeasureType = {}));
class MeasureTool {
    /**
     * constructor(viewer: Cesium.Viewer,options?: PolygonGraphics.ConstructorOptions);
     * @param viewer
     * @param options
     */
    constructor(viewer, options) {
        this.measureType = MeasureType.Distance;
        this.tempPositions = []; // 所有成图点
        this.viewer = viewer;
        this.options = Object.assign({ showAllDistance: true, showAllDistancePosition: 'center', polylineStyle: {}, polygonStyle: {}, labelStyle: {} }, options);
        // 自定义添加数据源图层
        this.dataSource = new Cesium.CustomDataSource('Measure_dataSource');
        this.viewer.dataSources.add(this.dataSource);
        //初始化事件
        this.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    }
    /**
     * 激活工具
     * @param measureType 测量类型
     */
    activate(measureType) {
        this.clearAll();
        this.measureType = measureType;
        this.registerEvents(); //注册鼠标事件
        // @ts-ignore
        this.viewer._element.style.cursor = 'crosshair';
    }
    /**
     * 取消激活工具
     */
    deactivate() {
        this.unRegisterEvents(); //取消鼠标事件
        this._mousePos = undefined;
        // @ts-ignore
        this.viewer._element.style.cursor = 'default';
    }
    /**
     * 清除所有
     */
    clearAll() {
        var _a;
        this.deactivate();
        (_a = this.dataSource) === null || _a === void 0 ? void 0 : _a.entities.removeAll();
        this.tempPositions = [];
    }
    //注册鼠标事件
    registerEvents() {
        this.leftClickEvent();
        this.rightClickEvent();
        this.mouseMoveEvent();
    }
    //解除鼠标事件
    unRegisterEvents() {
        var _a, _b, _c, _d;
        (_a = this.handler) === null || _a === void 0 ? void 0 : _a.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        (_b = this.handler) === null || _b === void 0 ? void 0 : _b.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        (_c = this.handler) === null || _c === void 0 ? void 0 : _c.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        (_d = this.handler) === null || _d === void 0 ? void 0 : _d.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    }
    //绘制结束 触发结束事件
    drawEnd() {
        var _a, _b;
        (_b = (_a = this.options) === null || _a === void 0 ? void 0 : _a.onDrawEnd) === null || _b === void 0 ? void 0 : _b.call(_a, this.measureType, this.tempPositions);
        this.deactivate();
    }
    // 鼠标左键事件
    leftClickEvent() {
        var _a;
        (_a = this.handler) === null || _a === void 0 ? void 0 : _a.setInputAction((e) => {
            let ray = this.viewer.camera.getPickRay(e.position); //获取一条射线
            if (!ray)
                return;
            let p = this.viewer.scene.globe.pick(ray, this.viewer.scene);
            if (!p)
                return;
            this.tempPositions.push(p.clone());
            // 开始绘制
            this.drawStart2InitEntity();
            // 刷新 label
            this.refreshEntityLabel();
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }
    // 鼠标移动事件
    mouseMoveEvent() {
        var _a;
        (_a = this.handler) === null || _a === void 0 ? void 0 : _a.setInputAction((e) => {
            if (this.tempPositions.length === 0)
                return;
            let ray = this.viewer.camera.getPickRay(e.endPosition); //获取一条射线
            if (!ray)
                return;
            let p = this.viewer.scene.globe.pick(ray, this.viewer.scene);
            if (!p)
                return;
            this._mousePos = p;
            // 刷新 label
            this.refreshEntityLabel();
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }
    // 鼠标右键事件
    rightClickEvent() {
        var _a;
        (_a = this.handler) === null || _a === void 0 ? void 0 : _a.setInputAction((e) => {
            let ray = this.viewer.camera.getPickRay(e.position); //获取一条射线
            if (!ray)
                return;
            let p = this.viewer.scene.globe.pick(ray, this.viewer.scene);
            if (!p)
                return;
            this.tempPositions.push(p.clone());
            // 结束绘制
            this.drawEnd();
            // 刷新 label
            this.refreshEntityLabel();
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }
    // 分类 entity实例
    drawStart2InitEntity() {
        if (this.tempPositions.length === 1) {
            // 第一次实例化一次，其他点以 CallbackProperty 获取
            switch (this.measureType) {
                case MeasureType.Distance:
                    this.addMeasureDistanceEntity();
                    break;
                case MeasureType.Area:
                    this.addMeasureAreaEntity();
                    break;
            }
        }
    }
    // 分类 刷新label操作
    refreshEntityLabel() {
        switch (this.measureType) {
            case MeasureType.Distance:
                this.addMeasureDistanceEntityLabel();
                break;
            case MeasureType.Area:
                this.addMeasureAreaEntityLabel();
                break;
        }
    }
    // 添加测距离entity
    addMeasureDistanceEntity() {
        var _a, _b;
        const _c = this.options.polylineStyle || {}, { positions } = _c, style = __rest(_c, ["positions"]);
        const id = `${this.measureType}-id`;
        (_a = this.dataSource) === null || _a === void 0 ? void 0 : _a.entities.removeById(id);
        (_b = this.dataSource) === null || _b === void 0 ? void 0 : _b.entities.add({
            id: id,
            polyline: Object.assign({ positions: new Cesium.CallbackProperty(() => {
                    let c = Array.from(this.tempPositions);
                    if (this._mousePos) {
                        c.push(this._mousePos);
                    }
                    return c;
                }, false), clampToGround: true, width: 3, material: new Cesium.PolylineDashMaterialProperty({
                    color: Cesium.Color.YELLOW,
                }), depthFailMaterial: new Cesium.PolylineDashMaterialProperty({
                    color: Cesium.Color.YELLOW,
                }) }, style),
        });
    }
    // 添加测面积entity
    addMeasureAreaEntity() {
        var _a, _b;
        const _c = this.options.polygonStyle || {}, { hierarchy } = _c, style1 = __rest(_c, ["hierarchy"]);
        const _d = this.options.polylineStyle || {}, { positions } = _d, style2 = __rest(_d, ["positions"]);
        const id = `${this.measureType}-id`;
        (_a = this.dataSource) === null || _a === void 0 ? void 0 : _a.entities.removeById(id);
        (_b = this.dataSource) === null || _b === void 0 ? void 0 : _b.entities.add({
            id: id,
            polygon: Object.assign({ hierarchy: new Cesium.CallbackProperty(() => {
                    if (this.tempPositions.length >= 2) {
                        let pts = Array.from(this.tempPositions);
                        if (this._mousePos) {
                            pts.push(this._mousePos);
                        }
                        return new Cesium.PolygonHierarchy(pts);
                    }
                }, false), material: Cesium.Color.RED.withAlpha(0.4) }, style1),
            polyline: Object.assign({ positions: new Cesium.CallbackProperty(() => {
                    let pts = Array.from(this.tempPositions);
                    if (this._mousePos) {
                        pts.push(this._mousePos);
                    }
                    pts.push(pts[0]); //与第一个点相连
                    return pts;
                }, false), clampToGround: true, width: 3, material: new Cesium.PolylineDashMaterialProperty({
                    color: Cesium.Color.YELLOW,
                }), depthFailMaterial: new Cesium.PolylineDashMaterialProperty({
                    color: Cesium.Color.YELLOW,
                }) }, style2),
        });
    }
    // 添加测距离entity label
    addMeasureDistanceEntityLabel() {
        if (this._mousePos) {
            // 移动中
            const len = this.tempPositions.length;
            if (len >= 1) {
                let [p1, p2] = [this.tempPositions[len - 1], this._mousePos];
                // 中点
                const centerP = (0, utils_1._mathMidpoint)(p1, p2);
                // 距离
                const distanceText = (0, utils_1._calcDistance2text)(p1, p2);
                this.addLabel(centerP, distanceText, len);
            }
        }
        else {
            const len = this.tempPositions.length;
            if (len >= 2) {
                let [p1, p2] = [this.tempPositions[len - 1], this.tempPositions[len - 2]];
                // 中点
                const centerP = (0, utils_1._mathMidpoint)(p1, p2);
                // 距离
                const distanceText = (0, utils_1._calcDistance2text)(p1, p2);
                this.addLabel(centerP, distanceText, len);
                if (this.options.showAllDistance && len >= 3) {
                    // 总距离
                    const allDistanceText = (0, utils_1._calcAllDistance2text)(this.tempPositions);
                    if (this.options.showAllDistancePosition === 'center') {
                        let points = [...this.tempPositions, this.tempPositions[0]];
                        const { centroid } = (0, utils_1._mathAreaAndCenter)(points);
                        this.addLabel(centroid, allDistanceText, 0);
                    }
                    else {
                        this.addLabel(p1, allDistanceText, 0);
                    }
                }
            }
        }
    }
    // 添加测面积entity label
    addMeasureAreaEntityLabel() {
        if (this._mousePos) {
            // 移动中
            const len = this.tempPositions.length;
            if (len >= 2) {
                let points = [...this.tempPositions, this._mousePos, this.tempPositions[0]];
                const { text, centroid } = (0, utils_1._calcArea2text)(points);
                this.addLabel(centroid, text);
            }
        }
        else {
            const len = this.tempPositions.length;
            if (len >= 3) {
                let points = [...this.tempPositions, this.tempPositions[0]];
                const { text, centroid } = (0, utils_1._calcArea2text)(points);
                this.addLabel(centroid, text);
            }
        }
    }
    // 画标签
    addLabel(centerP, label, index = 1) {
        var _a, _b;
        const _c = this.options.labelStyle || {}, { text } = _c, style = __rest(_c, ["text"]);
        const id = `${this.measureType}-id-label-${index}`;
        (_a = this.dataSource) === null || _a === void 0 ? void 0 : _a.entities.removeById(id);
        (_b = this.dataSource) === null || _b === void 0 ? void 0 : _b.entities.add({
            id: id,
            position: centerP,
            label: Object.assign({ text: label, font: '14px sans-serif', style: Cesium.LabelStyle.FILL_AND_OUTLINE, fillColor: Cesium.Color.YELLOW, showBackground: true, backgroundColor: new Cesium.Color(0.165, 0.165, 0.165, 0.8), backgroundPadding: new Cesium.Cartesian2(6, 6), pixelOffset: new Cesium.Cartesian2(0, -25), disableDepthTestDistance: Number.POSITIVE_INFINITY }, style),
        });
    }
}
exports.default = MeasureTool;
