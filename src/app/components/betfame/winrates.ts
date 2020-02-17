import _ from 'lodash'

export const getWinRatesData = data => {
    let copy = _.cloneDeep(data)
    let result = {
        seniors: {
            'asianHandicapStats-full': [],
            'asianHandicapStats-half': [],
            'overUnderStats-fulltime-OVER': [],
            'overUnderStats-fulltime-UNDER': [],
            'overUnderStats-halftime-OVER': [],
            'overUnderStats-halftime-UNDER': [],
        },
        premiums: {
            'asianHandicapStats-full': [],
            'asianHandicapStats-half': [],
            'overUnderStats-fulltime-OVER': [],
            'overUnderStats-fulltime-UNDER': [],
            'overUnderStats-halftime-OVER': [],
            'overUnderStats-halftime-UNDER': [],
        },
    }
    for (let tipsterGroup in data) {
        for (let tipster in copy[tipsterGroup].asianHandicapStats) {
            for (let type in copy[tipsterGroup].asianHandicapStats[tipster]) {
                let totalTips = Object.keys(copy[tipsterGroup].asianHandicapStats[tipster][type])
                    .map(odd => copy[tipsterGroup].asianHandicapStats[tipster][type][odd].count)
                    .reduce((a, b) => a + b, 0)
                let totalWins = Object.keys(copy[tipsterGroup].asianHandicapStats[tipster][type])
                    .map(odd => copy[tipsterGroup].asianHandicapStats[tipster][type][odd].wins)
                    .reduce((a, b) => a + b, 0)
                result[tipsterGroup][`asianHandicapStats-${type}`].push({
                    tipster,
                    winRate: `${isNaN((totalWins * 100) / totalTips) ? 0 : ((totalWins * 100) / totalTips).toFixed(2)}%`,
                    totalTips,
                })
            }
        }

        for (let tipster in copy[tipsterGroup].overUnderStats) {
            for (let type in copy[tipsterGroup].overUnderStats[tipster]) {
                for (let type2 in copy[tipsterGroup].overUnderStats[tipster][type]) {
                    let totalTips = Object.keys(copy[tipsterGroup].overUnderStats[tipster][type][type2])
                        .map(odd => copy[tipsterGroup].overUnderStats[tipster][type][type2][odd].count)
                        .reduce((a, b) => a + b, 0)
                    let totalWins = Object.keys(copy[tipsterGroup].overUnderStats[tipster][type][type2])
                        .map(odd => copy[tipsterGroup].overUnderStats[tipster][type][type2][odd].wins)
                        .reduce((a, b) => a + b, 0)
                    result[tipsterGroup][`overUnderStats-${type}-${type2}`].push({
                        tipster,
                        winRate: `${isNaN((totalWins * 100) / totalTips) ? 0 : ((totalWins * 100) / totalTips).toFixed(2)}%`,
                        totalTips,
                    })
                }
            }
        }
    }

    return result
}
