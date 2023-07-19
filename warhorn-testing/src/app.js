addEventListener("DOMContentLoaded", async (event) => {
    show_data();

    let $inputs = document.querySelectorAll('.filter input');
    if ($inputs) $inputs.forEach($input => $input.addEventListener('change', onFilterChange));
});

let _raw_data = [];
let _template

async function show_data() {
    await load_data();
    update_display();
}


async function load_data() {
    _template = await fetch_template();
    _raw_data = await fetch_data();
}
function update_display() {
    let data = filter_data(_raw_data, _filters);
    display_data(_template, data);
}


async function fetch_template() {
    let url = './src/template-item.html';

    const response = await fetch(url);
    const value = await response.text();
    return value;
}



async function fetch_data() {
    let url = './mock-api/session-listings.json';
    // url = 'https://warhorn.net/api/session-listings?filter%5Bstatus%5D=published&filter%5Bvisible%5D=true&filter%5BgameSystemId%5D=61&filter%5Bonline%5D=true&filter%5Blanguage%5D=en&filter%5BstartsAtOrAfter%5D={ISO_NOW}&filter%5BvirtualTableTop%5D=foundry&include=campaignMode%2Cscenario.campaign.gameSystem%2Cscenario.campaignTags%2Cscenario.factions%2Cscenario.gameSystem%2CvirtualTableTops%2CvoiceChatServices&page%5Bnumber%5D=1&page%5Bsize%5D=25&sort=dates';
    url = 'https://warhorn.net/api/session-listings?filter%5Bstatus%5D=published&filter%5Bvisible%5D=true&filter%5BgameSystemId%5D=61&filter%5Bonline%5D=true&filter%5Blanguage%5D=en&filter%5BstartsAtOrAfter%5D={ISO_NOW}&include=campaignMode%2Cscenario.campaign.gameSystem%2Cscenario.campaignTags%2Cscenario.factions%2Cscenario.gameSystem%2CvirtualTableTops%2CvoiceChatServices&page%5Bnumber%5D=1&page%5Bsize%5D=25&sort=dates';
    url = url.replace('{ISO_NOW}', (new Date()).toISOString());

    const response = await fetch(url);
    const jsonData = await response.json();

    // Load included reference objects
    let includedObjects = extactIncludedObjects(jsonData.included);

    // Load data
    let data = [];
    for (let dataitem of jsonData.data) {
        let item = dataitem.attributes;

        addReferencedObjects(item, dataitem.relationships, includedObjects);
        

        // https://warhorn.net/events/pocket-mission-adventurers-league-online/schedule/sessions/525613c2-7196-4d5b-bea3-5cce67a48a80
        data.warhornUrl = `https://warhorn.net/events/{}/schedule/sessions/{uuid}`;

        // Add the full Session object to the list of data
        data.push(item);
    }

    return data;
}


/**
 * Returns a hash using type and id as hash keys
 * 
 * @param {*} includedObjects 
 * @returns hash [{object type}] [{object id}]
 */
function extactIncludedObjects(includedObjects) {
    let incObjects = {};

    // Read `type` and `id`, and restructure in hash, using these as keys 
    for (let item of includedObjects) {
        let id = item.id, type = item.type;

        if (!incObjects[type]) incObjects[type] = {};

        incObjects[type][id] = { attributes: item.attributes, relationships: item.relationships};
    }

    return incObjects;
}

/**
 * Include referenced relationsships into `item`, from`includedObjects`.
 * 
 * @param {*} item Item to append new objects
 * @param {*} relationships Object with references to other objects
 * @param {*} includedObjects Hash of the objects that may be included
 */
function addReferencedObjects(item, relationships, includedObjects) {
    if (relationships == null) return;
    if (includedObjects == null) return;

    // Include referenced objects
    for (let relationType in relationships) {
        let relation = relationships[relationType]?.data;

        // If `relation`is an array, pick the first one
        if (Array.isArray(relation)) { 
            if (relation.length == 0) relation = null;
            else {
                relation = relation[0];
                if (relation.length > 1) console.warn(`Relation has ${relation.length} entries (${session.name})`);            
            }
        }

        if (relation) {
            let id = relation.id, type = relation.type;

            // Add the referenced object to the session
            item[relationType] = includedObjects[type][id]?.attributes;

            let indirectRelationships = includedObjects[type][id]?.relationships;
            if (indirectRelationships) {
                addReferencedObjects(item, indirectRelationships, includedObjects);                    
            }
        }
    }
}







function display_data(template, data) {
    let $result = document.querySelector('.result');
    $result.innerHTML = "";

    for (let id in data) {
        let item = data[id];
        let $item = document.createElement('item');
        $item.innerHTML = template_replace(template, item);
        $result.appendChild($item);
    }
}


function template_replace(template, attributes) {
    const reg = new RegExp(/{([\w\.]+:?\w+)}/, 'g');
    const locale = 'en-GB';
    let dt_format = new Intl.DateTimeFormat(locale, { dateStyle: 'full', timeStyle: 'long' });
    let d_format = new Intl.DateTimeFormat(locale, { dateStyle: 'long'});
    let t_format = new Intl.DateTimeFormat(locale, { timeStyle: 'short' });
    let w_format = new Intl.DateTimeFormat(locale, { weekday: 'short' });

    let matches = template.matchAll(reg);

    for (let match of matches) {
        let parts = match[1].split(':');
        let key = parts[0];
        let value = get_value(attributes, key);
        if (value) {
            if (parts.length == 1) {
                template = template.replace('{' + key + '}', value);
            } else if (parts.length == 2) {
                let format = ':' + parts[1];
                if (format == ':d') {
                    value = w_format.format(new Date(value)) + ' ' + d_format.format(new Date(value));
                }
                if (format == ':t') {
                    value = t_format.format(new Date(value));
                }
                if (format == ':dt') {
                    value = dt_format.format(new Date(value));
                }
                if (format == ':z') {
                    value = (new Date(value)).getTimezoneOffset()/60 + 'UTC';
                }
                template = template.replace('{' + key + format + '}', value);
            }
        }
    }
    return template;
}

function get_value(dict, key) {
    let index = key.indexOf('.');
    if (index == -1) {
        if (dict.hasOwnProperty(key)) return dict[key];
    } else {
        let prefix = key.slice(0, index);
        let rest = key.slice(index + 1);
        if (dict.hasOwnProperty(prefix)) return get_value(dict[prefix], rest);
    }
    return undefined;
}