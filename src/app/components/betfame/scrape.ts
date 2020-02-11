;(() => {
    let positions = document.querySelectorAll('.tlist .pos p')
    let tipsters = document.querySelectorAll('.tlist .tipsters a')
    let noTips = document.querySelectorAll('.tlist .notips p')
    let hits = document.querySelectorAll('.tlist .hit p')
    let profit = document.querySelectorAll('.tlist .profit p')
    let odds = document.querySelectorAll('.tlist .odds p')
    let rois = document.querySelectorAll('.tlist .roi p')
    let wins = document.querySelectorAll('.tlist .win p')
    let draws = document.querySelectorAll('.tlist .draw p')
    let losses = document.querySelectorAll('.tlist .lose p')

    let allTipsters = []
    for (let i = 0; i < positions.length; i++) {
        let tipster = {}
        tipster['position'] = parseInt(positions[i].innerHTML)
        tipster['tipster'] = tipsters[i].innerHTML
        tipster['noTips'] = parseInt(noTips[i].innerHTML)
        tipster['hits'] = parseFloat(hits[i].innerHTML)
        tipster['profit'] = parseFloat(profit[i].innerHTML)
        tipster['odds'] = parseFloat(odds[i].innerHTML)
        tipster['roi'] = parseFloat(rois[i].innerHTML)
        tipster['wins'] = parseInt(wins[i].innerHTML)
        tipster['draws'] = parseInt(draws[i].innerHTML)
        tipster['losses'] = parseInt(losses[i].innerHTML)
        allTipsters.push(tipster)
    }
    return JSON.stringify(allTipsters)
})()
