import * as Cesium from 'cesium';
import area from '@turf/area';
import centroid from '@turf/centroid';
/**
 * Cartesian3转经纬度
 * @param p 点
 * @returns
 */
export declare const _cartesian2Degree: (p: Cesium.Cartesian3) => number[];
/**
 * 经纬度转Cartesian3
 * @param p 点
 * @returns
 */
export declare const _degree2Cartesian: (p: number[]) => Cesium.Cartesian3;
/**
 * 计算两点的距离
 * @param p1 点1
 * @param p2 点2
 * @returns （米）
 */
export declare const _mathDistance: (p1: Cesium.Cartesian3, p2: Cesium.Cartesian3) => number;
/**
 * 计算两点的中点
 * @param p1
 * @param p2
 * @returns p:Cartesian3
 */
export declare const _mathMidpoint: (p1: Cesium.Cartesian3, p2: Cesium.Cartesian3) => Cesium.Cartesian3;
/**
 * 计算距离，并转换单位
 * @private
 */
export declare const _calcDistance2text: (p1: Cesium.Cartesian3, p2: Cesium.Cartesian3) => string;
/**
 * 计算距离，并转换单位
 * @private
 */
export declare const _calcAllDistance2text: (positions: Cesium.Cartesian3[]) => string;
/**
 * 计算面积，并转换单位
 * @private
 */
export declare const _calcArea2text: (points: Cesium.Cartesian3[]) => {
    text: string;
    centroid: Cesium.Cartesian3;
};
/**
 * 计算多边形面积和多边形的中心
 * @private
 */
export declare const _mathAreaAndCenter: (points: Cesium.Cartesian3[]) => {
    area: number;
    centroid: Cesium.Cartesian3;
};
