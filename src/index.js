var nodePath = require('path');
var fs = require('fs');

var FS_READ_OPTIONS = { encoding: 'utf8' };

var packageCache = {};
var rootPackagesCache = {};


function tryPackage(path) {
    var pkg = packageCache[path];

    if (pkg !== undefined) {
        return pkg;
    }

    var pkgJSON;

    try {
        pkgJSON = fs.readFileSync(path, FS_READ_OPTIONS);
    } catch(e) {
    }

    if (pkgJSON) {
        pkg = JSON.parse(pkgJSON);
        pkg.__filename = path;
        pkg.__dirname = nodePath.dirname(path);
    } else {
        pkg = null;
    }

    packageCache[path] = pkg;

    return pkg;
}

function getRootPackage(dirname) {
    var rootPkg = rootPackagesCache[dirname];
    if (rootPkg) {
        return rootPkg;
    }

    var currentDir = dirname;
    while (true) {
        var packagePath = nodePath.join(currentDir, 'package.json');
        var pkg = tryPackage(packagePath);
        if (pkg && pkg.name) {
            rootPkg = pkg;
            break;
        }

        var parentDir = nodePath.dirname(currentDir);
        if (!parentDir || parentDir === currentDir) {
            break;
        }
        currentDir = parentDir;
    }

    rootPackagesCache[dirname] = rootPkg || null;

    return rootPkg;
}


function getRootDir(path) {
    var rootPkg = getRootPackage(path);
    return rootPkg && rootPkg.__dirname;
}

exports.getRootPackage = getRootPackage;
exports.getRootDir = getRootDir;