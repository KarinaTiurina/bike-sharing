export const metersToLatLng = (meters) => meters / 111111;

export const parseNullableInt = (str) => {
    if (str === null || str === undefined) {
        return null;
    }

    const result = parseInt(str);
    if (isNaN(result)) {
        return null;
    }
}

export const parseNullableFloat = (str) => {
    if (str === null || str === undefined) {
        return null;
    }

    const result = parseFloat(str);
    if (isNaN(result)) {
        return null;
    }

    return result;
}

export const applyOptional = (fn, value) => {
    if (value === null || value === undefined) {
        return null;
    }

    return fn(value);
}
