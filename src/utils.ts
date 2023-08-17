import * as Cesium from 'cesium'
import { polygon } from '@turf/helpers'
import area from '@turf/area'
import centroid from '@turf/centroid'

/**
 * Cartesian3转经纬度
 * @param p 点
 * @returns
 */
export const _cartesian2Degree = (p: Cesium.Cartesian3) => {
  const carto_pt = Cesium.Cartographic.fromCartesian(p)
  const pt = [Cesium.Math.toDegrees(carto_pt.longitude), Cesium.Math.toDegrees(carto_pt.latitude), carto_pt.height]
  return pt
}

/**
 * 经纬度转Cartesian3
 * @param p 点
 * @returns
 */
export const _degree2Cartesian = (p: number[]) => {
  const Cartesian3 = Cesium.Cartesian3.fromDegrees(p[0], p[1], p[3])
  return Cartesian3
}

/**
 * 计算两点的距离
 * @param p1 点1
 * @param p2 点2
 * @returns （米）
 */
export const _mathDistance = (p1: Cesium.Cartesian3, p2: Cesium.Cartesian3) => {
  return Cesium.Cartesian3.distance(p1, p2)
}

/**
 * 计算两点的中点
 * @param p1
 * @param p2
 * @returns p:Cartesian3
 */
export const _mathMidpoint = (p1: Cesium.Cartesian3, p2: Cesium.Cartesian3) => {
  return Cesium.Cartesian3.midpoint(p1, p2, new Cesium.Cartesian3())
}

/**
 * 计算距离，并转换单位
 * @private
 */
export const _calcDistance2text = (p1: Cesium.Cartesian3, p2: Cesium.Cartesian3) => {
  let text = ''
  const distance = _mathDistance(p1, p2)
  if (distance > 1000) {
    text = (distance / 1000).toFixed(2) + ' km'
  } else {
    text = distance.toFixed(2) + ' m'
  }
  return text
}
/**
 * 计算距离，并转换单位
 * @private
 */
export const _calcAllDistance2text = (positions: Cesium.Cartesian3[]) => {
  let allDistance = 0
  for (let index = 0; index < positions.length - 1; index++) {
    const [p1, p2] = [positions[index], positions[index + 1]]
    const distance = _mathDistance(p1, p2)
    allDistance = allDistance + distance
  }

  let text = ''
  if (allDistance > 1000) {
    text = (allDistance / 1000).toFixed(2) + ' km'
  } else {
    text = allDistance.toFixed(2) + ' m'
  }
  return '总长：' + text
}

/**
 * 计算面积，并转换单位
 * @private
 */
export const _calcArea2text = (points: Cesium.Cartesian3[]) => {
  let text = ''
  const { area, centroid } = _mathAreaAndCenter(points)
  if (area < 1000000) {
    text = Math.abs(area).toFixed(4) + ' ㎡'
  } else {
    text = Math.abs(Number((area / 1000000.0).toFixed(4))) + ' k㎡'
  }
  return { text, centroid }
}

/**
 * 计算多边形面积和多边形的中心
 * @private
 */
export const _mathAreaAndCenter = (
  points: Cesium.Cartesian3[]
): {
  area: number
  centroid: Cesium.Cartesian3
} => {
  const pts = points.map((p) => {
    // 转经纬度
    const pt = _cartesian2Degree(p)
    return pt
  })
  const _polygon = polygon([pts])
  // 面积
  const _area = area(_polygon)
  // 多边形中心
  const _cpFeature = centroid(_polygon)
  const p = _cpFeature.geometry.coordinates
  // 转Cartesian
  const _centroid = _degree2Cartesian(p)
  return {
    area: _area,
    centroid: _centroid,
  }
}
