import * as THREE from 'three';

const DEG2RAD = Math.PI / 180;

/**
 * Convertit une position géographique (lat/long en degrés) en point 3D sur une
 * sphère de rayon `radius`. Convention alignée avec une projection
 * équirectangulaire standard (long -180 → +180, lat +90 → -90). Utilisée à la
 * fois pour tracer les côtes/graticule et pour poser les pastilles circuits :
 * comme tout partage cette même fonction, les circuits tombent exactement sur
 * les continents, sans risque de désalignement.
 */
export function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * DEG2RAD;
  const theta = (lng + 180) * DEG2RAD;
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}
