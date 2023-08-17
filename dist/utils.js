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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports._mathAreaAndCenter = exports._calcArea2text = exports._calcAllDistance2text = exports._calcDistance2text = exports._mathMidpoint = exports._mathDistance = exports._degree2Cartesian = exports._cartesian2Degree = void 0;
const Cesium = __importStar(require("cesium"));
const helpers_1 = require("@turf/helpers");
const area_1 = __importDefault(require("@turf/area"));
const centroid_1 = __importDefault(require("@turf/centroid"));
/**
 * Cartesian3转经纬度
 * @param p 点
 * @returns
 */
const _cartesian2Degree = (p) => {
    const carto_pt = Cesium.Cartographic.fromCartesian(p);
    const pt = [Cesium.Math.toDegrees(carto_pt.longitude), Cesium.Math.toDegrees(carto_pt.latitude), carto_pt.height];
    return pt;
};
exports._cartesian2Degree = _cartesian2Degree;
/**
 * 经纬度转Cartesian3
 * @param p 点
 * @returns
 */
const _degree2Cartesian = (p) => {
    const Cartesian3 = Cesium.Cartesian3.fromDegrees(p[0], p[1], p[3]);
    return Cartesian3;
};
exports._degree2Cartesian = _degree2Cartesian;
/**
 * 计算两点的距离
 * @param p1 点1
 * @param p2 点2
 * @returns （米）
 */
const _mathDistance = (p1, p2) => {
    return Cesium.Cartesian3.distance(p1, p2);
};
exports._mathDistance = _mathDistance;
/**
 * 计算两点的中点
 * @param p1
 * @param p2
 * @returns p:Cartesian3
 */
const _mathMidpoint = (p1, p2) => {
    return Cesium.Cartesian3.midpoint(p1, p2, new Cesium.Cartesian3());
};
exports._mathMidpoint = _mathMidpoint;
/**
 * 计算距离，并转换单位
 * @private
 */
const _calcDistance2text = (p1, p2) => {
    let text = '';
    const distance = (0, exports._mathDistance)(p1, p2);
    if (distance > 1000) {
        text = (distance / 1000).toFixed(2) + ' km';
    }
    else {
        text = distance.toFixed(2) + ' m';
    }
    return text;
};
exports._calcDistance2text = _calcDistance2text;
/**
 * 计算距离，并转换单位
 * @private
 */
const _calcAllDistance2text = (positions) => {
    let allDistance = 0;
    for (let index = 0; index < positions.length - 1; index++) {
        const [p1, p2] = [positions[index], positions[index + 1]];
        const distance = (0, exports._mathDistance)(p1, p2);
        allDistance = allDistance + distance;
    }
    let text = '';
    if (allDistance > 1000) {
        text = (allDistance / 1000).toFixed(2) + ' km';
    }
    else {
        text = allDistance.toFixed(2) + ' m';
    }
    return '总长：' + text;
};
exports._calcAllDistance2text = _calcAllDistance2text;
/**
 * 计算面积，并转换单位
 * @private
 */
const _calcArea2text = (points) => {
    let text = '';
    const { area, centroid } = (0, exports._mathAreaAndCenter)(points);
    if (area < 1000000) {
        text = Math.abs(area).toFixed(4) + ' ㎡';
    }
    else {
        text = Math.abs(Number((area / 1000000.0).toFixed(4))) + ' k㎡';
    }
    return { text, centroid };
};
exports._calcArea2text = _calcArea2text;
/**
 * 计算多边形面积和多边形的中心
 * @private
 */
const _mathAreaAndCenter = (points) => {
    const pts = points.map((p) => {
        // 转经纬度
        const pt = (0, exports._cartesian2Degree)(p);
        return pt;
    });
    const _polygon = (0, helpers_1.polygon)([pts]);
    // 面积
    const _area = (0, area_1.default)(_polygon);
    // 多边形中心
    const _cpFeature = (0, centroid_1.default)(_polygon);
    const p = _cpFeature.geometry.coordinates;
    // 转Cartesian
    const _centroid = (0, exports._degree2Cartesian)(p);
    return {
        area: _area,
        centroid: _centroid,
    };
};
exports._mathAreaAndCenter = _mathAreaAndCenter;
