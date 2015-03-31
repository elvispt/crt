// on request
onmessage = function (e) {
    var items = e.data.items,
        limit = e.data.limit,
        numItemsToRemove = items.length - limit,
        itemIdsToRemove = [];
    items.sort(function (a, b) {
        return a.time > b.time;
    });
    items.slice(0, numItemsToRemove).forEach(function (value, index) {
        itemIdsToRemove.push(value.id);
    });
    postMessage(itemIdsToRemove);
};
