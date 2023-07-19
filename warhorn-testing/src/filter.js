
let _filters = {weekday: [], level: null, time: {start:0, end:24}};

function onFilterChange(event) {
    let target = event.target;
    switch(target.name) {
        case 'filter-level':
            let level = parseInt(target.value);
            if (isNaN(level)) _filters.level = null;
            else _filters.level = level;
            break;
        case 'filter-weekday':
            let weekday = parseInt(target.value);
            _filters.weekday[weekday] = target.checked;
            if (_filters.weekday.filter(w => w).length == 0) _filters.weekday = []
            break;
        case 'filter-time':
            let value = parseInt(target.value);
            if (target.id == 'filter-time-from') _filters.time.start = value;
            else _filters.time.end = value;
            break;
        default:
            console.error(`Undefined input type: ${event.target.name}`);
    }

   update_display();
}



function filter_data(raw_data, filters) {
    let data = raw_data;

    // Filter - Level
    data = data.filter(entry => {
        if (!_filters.level) return true;  // Either zero or null
        if (_filters.level < parseInt(entry?.scenario?.minLevel)) return false; // If out of bounds, or minLevel is null
        if (_filters.level > parseInt(entry?.scenario?.maxLevel)) return false; // If out of bounds, or maxLevel is null
        return true;
        //return _filters.level >= entry?.scenario?.minLevel && _filters.level <= entry?.scenario?.maxLevel;
    });

    // Filter - Weekday
    data = data.filter(entry => {
        if (filters.weekday.length == 0) return true;
        if (!entry.startsAtDatetime) entry.startsAtDatetime = new Date(entry.startsAt);
        let weekday = entry.startsAtDatetime.getDay();
        return filters.weekday[weekday];
    });

    // Filter - Time
    data = data.filter(entry => {
        // Parse text timestamp - only once
        if (!entry.startsAtDatetime) entry.startsAtDatetime = new Date(entry.startsAt);
        if (!entry.endsAtDatetime) entry.endsAtDatetime = new Date(entry.endsAt);

        // Get beginnings and endings
        let startsAt = entry.startsAtDatetime.getHours()
        let endsAt = entry.endsAtDatetime.getHours()
        let awake = _filters.time.start;
        let sleeps = _filters.time.end;

        // Adjust endings, if before beginnings
        if (endsAt <= startsAt) endsAt += 24;
        if (sleeps <= awake) sleeps += 24;

        // Test if entry is within awake time
        if (startsAt < awake) return false;
        if (endsAt > sleeps) return false;
        return true;
    });

    return data;
}

