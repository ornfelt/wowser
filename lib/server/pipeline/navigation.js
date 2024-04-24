'use strict';

// npm install ffi-napi ref-napi ref-struct-napi

//Object.defineProperty(exports, "__esModule", {
//  value: true
//});

var ffiNapi = require('ffi-napi');
var refNapi = require('ref-napi');
var StructDI = require('ref-struct-di');
var Struct = StructDI(refNapi);
//const ArrayType = require('ref-array-di')(refNapi); // Requires npm install ref-array-di

// Define your types
var float = refNapi.types.float;
var uint32 = refNapi.types.uint32;
var intPtr = refNapi.refType(refNapi.types.int);

// Define the XYZ structure similar to C++ structure
var XYZ = Struct({
  X: float,
  Y: float,
  Z: float
});

// Define a pointer type for XYZ
var XYZPtr = refNapi.refType(XYZ);

// Define the class
class Navigation {
  static libraryPath = "./Navigation.dll";
  //static libraryPath = "./libNavigation";

  // Load the library statically
  static NavigationLib = new ffiNapi.Library(Navigation.libraryPath, {
    'CalculatePath': [XYZPtr, [uint32, XYZ, XYZ, 'bool', intPtr]],
    'MoveForward': [XYZPtr, [uint32, float, float, float, float]],
    'CalculatePathWithParams': [XYZPtr, [uint32, XYZ, XYZ, 'bool', intPtr, float, float, float]],
    'MoveForwardWithParams': [XYZPtr, [uint32, float, float, float, float, float, float, float, float]],
    'FreePathArr': ['void', [XYZPtr]],
  });

  static calculatePath(startX, startY, startZ, endX, endY, endZ, mapId = 0, straightPath = false, hoverHeight, objectSize, collisionHeight) {
    const start = new XYZ({ X: startX, Y: startY, Z: startZ });
    const end = new XYZ({ X: endX, Y: endY, Z: endZ });
    //console.log("x: " + start.X + ", y: " + start.Y + ", z: " + start.Z);
    //console.log("x: " + end.X + ", y: " + end.Y + ", z: " + end.Z);
    //console.log("mapId: " + mapId + ", straightPath: " + straightPath);
    var lengthPtr = refNapi.alloc('int');
    let path = [];
    var pathPtr = null;

    try {
        //pathPtr = Navigation.NavigationLib.CalculatePath(mapId, start, end, straightPath, lengthPtr);
        pathPtr = Navigation.NavigationLib.CalculatePathWithParams(mapId, start, end, straightPath, lengthPtr, hoverHeight, objectSize, collisionHeight);
        const pathLength = lengthPtr.deref();

        if (pathPtr !== null && pathLength > 0) {
            //console.log("Path Length:", pathLength);

            // Access the buffer from the pointer
            const pathBuffer = refNapi.reinterpret(pathPtr, XYZ.size * pathLength, 0);

            for (let i = 0; i < pathLength; i++) {
                // Calculate the offset for each XYZ in the buffer
                const xyzBuffer = refNapi.reinterpret(pathBuffer, XYZ.size, i * XYZ.size);

                // Create an XYZ instance from the buffer
                const xyz = new XYZ(xyzBuffer);

                // Add the xyz to the path array
                path.push({ X: xyz.X, Y: xyz.Y, Z: xyz.Z });
                //console.log(`Point ${i}: X=${xyz.X}, Y=${xyz.Y}, Z=${xyz.Z}`);
            }
        } else {
            console.error("Failed to calculate path or path length was 0.");
            return null;
        }
    } catch (error) {
        console.error(`An error occurred while calculating the path: ${error.message}`);
        return null;
    } finally {
        Navigation.NavigationLib.FreePathArr(pathPtr);
    }
    return path;
  }

  //static moveForward(mapId, startX, startY, startZ, angle) {
  static moveForward(mapId, startX, startY, startZ, angle, hoverHeight, objectSize, collisionHeight, dist) {
    //console.log("x: " + startX + ", y: " + startY + ", z: " + startZ);
    //console.log("mapId: " + mapId + ", angle: " + angle);
    let path = [];
    var pathPtr = null;

    try {
        //pathPtr = Navigation.NavigationLib.MoveForward(mapId, startX, startY, startZ, angle);
        //pathPtr = Navigation.NavigationLib.MoveForwardWithParams(mapId, startX, startY, startZ, angle, hoverHeight, objectSize, collisionHeight);
        pathPtr = Navigation.NavigationLib.MoveForwardWithParams(mapId, startX, startY, startZ, angle, hoverHeight, objectSize, collisionHeight, dist);
        if (pathPtr !== null) {
            const xyzBuffer = refNapi.reinterpret(pathPtr, XYZ.size);
            const xyz = new XYZ(xyzBuffer);
            path.push({ X: xyz.X, Y: xyz.Y, Z: xyz.Z });
            //console.log("Got: " + xyz.X);
        } else {
            console.error("Failed to calculate path.");
            return null;
        }
    } catch (error) {
        console.error(`An error occurred while calculating the path: ${error.message}`);
        return null;
    }
    return path;
  }
}

// Usage example
// Navigation.calculatePath(-614.7, -4335.4, 40.4, -590.2, -4206.1, 38.7);

module.exports.Navigation = Navigation; // For exporting as a named export
//module.exports = Navigation; // For exporting as a default export
