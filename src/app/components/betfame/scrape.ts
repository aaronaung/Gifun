var getStatsForTipsters = () => {
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
}

var getTotalGoalStats = () => {
    let tipsterName = document.querySelector('.tipster-profile .pdesc h2').innerHTML
    let listItems = [...document.querySelectorAll('.perlist li')]
    let data = {}
    let fullTimeTotalGoals = listItems
        .filter(listItem => {
            return (
                listItem.querySelector('.type').innerHTML === '<p>Total goal<br>FullTime</p>' &&
                listItem.querySelector('.tip p').innerHTML !== '-'
            )
        })
        .map(li => {
            let tip = li.querySelector('.tip p').innerHTML
            let tipType = tip.match(/[A-Za-z]/g).join('')
            let tipGoals = parseFloat(tip.replace(tipType, '').trim())
            let betResult = li.querySelector('.result i').innerHTML
            tipType = tipType.toUpperCase()
            return {
                tipType,
                tipGoals,
                betResult,
            }
        })
        .filter(r => r.tipType !== 'POSTPONED' && r.tipGoals !== NaN && r.betResult !== 'VOID')
    let detail = { OVER: {}, UNDER: {} }
    fullTimeTotalGoals.forEach(t => {
        detail[t.tipType][t.tipGoals] = {
            count:
                detail[t.tipType][t.tipGoals] && detail[t.tipType][t.tipGoals]['count'] !== undefined
                    ? detail[t.tipType][t.tipGoals]['count']
                    : 0,
            wins:
                detail[t.tipType][t.tipGoals] && detail[t.tipType][t.tipGoals]['wins'] !== undefined
                    ? detail[t.tipType][t.tipGoals]['wins']
                    : 0,
        }
        if (t.betResult.toUpperCase() === 'WIN') {
            detail[t.tipType][t.tipGoals]['wins'] += 1
        }
        detail[t.tipType][t.tipGoals]['count'] += 1
    })

    return JSON.stringify({
        [tipsterName]: {
            // tips: fullTimeTotalGoals,
            ...detail,
        },
    })
}

getTotalGoalStats()
