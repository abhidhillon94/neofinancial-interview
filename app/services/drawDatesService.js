const axiosRetry = require('axios-retry');
const axios = require('axios');
const moment = require('moment');
const commonConstants = require('../constants/commonConstants');

/**
 * responsible to fetch and cache draw dates with winning numbers
 */
class DrawDatesService {

    static FETCH_RETRY_SECONDS = 300;

    constructor () {
        axiosRetry(axios, { retries: 3 });
        this.drawDateNumbersMap = null;
        this.lastDrawDatesFetchTime = null;
    }

    setDrawDateNumbersMap = (drawDateNumbersMap) => this.drawDateNumbersMap = drawDateNumbersMap;
    getDrawDateNumbersMap = () => this.drawDateNumbersMap;

    setLastDrawDatesFetchTime = (lastDrawDatesFetchTime) => this.lastDrawDatesFetchTime = lastDrawDatesFetchTime;
    getLastDrawDatesFetchTime = () => this.lastDrawDatesFetchTime;

    /**
     * returns a hashmap of draw date and picked numbers where draw date is date in UTC
     */
    getDrawDateAndNumbersMap = async () => {
        await this.refreshDrawDatesIfRequired();
        return this.getDrawDateNumbersMap();
    }

    refreshDrawDatesIfRequired = async () => {
        if (this.isDrawDatesFetchRequired()) {
            this.setLastDrawDatesFetchTime(moment.utc());
            const arrDrawDatesInfo = await this.fetchDrawDatesFromPublicApi();
            if (arrDrawDatesInfo.length > 0) {
                const drawDateNumbersMap = this.generateDrawDatesAndPicksHashMap(arrDrawDatesInfo);
                this.setDrawDateNumbersMap(drawDateNumbersMap);
            }        
        }
    }

    fetchDrawDatesFromPublicApi = async () => {
        let arrDrawDatesInfo = [];
        try {
            // url can be put in a env specific config file if it is different across environemnts
            const response = await axios.get('https://data.ny.gov/resource/d6yy-54nr.json');

            if (
                response.status === 200 && 
                response.data && 
                Array.isArray(response.data) && 
                response.data.length > 0
            ) {
                arrDrawDatesInfo = response.data;
            } else {
                console.error(`${moment.utc()} : Invalid response from GET draw dates request`);
            }
        } catch (error) {
            console.error(`${moment.utc()} : GET draw dates request failure at `);
        }
        return arrDrawDatesInfo;
    }

    getLastOccuranceOfDayOfWeek = (isoDayOfWeek) => {
        const todayStartOfDay = moment.utc().startOf('day');
        const currentDayOfWeek = todayStartOfDay.isoWeekday();
        let lastOccurance;

        if (currentDayOfWeek >= isoDayOfWeek) {
            lastOccurance = moment.utc().day(isoDayOfWeek).startOf('day');
        } else {
            lastOccurance = moment.utc().day(isoDayOfWeek - 7).startOf('day');
        }

        return lastOccurance;
    }

    isDrawDatesFetchRequired = () => {
        let lastWednesday = this.getLastOccuranceOfDayOfWeek(commonConstants.DAYS_OF_WEEK.WEDNESDAY);
        let lastSaturday = this.getLastOccuranceOfDayOfWeek(commonConstants.DAYS_OF_WEEK.SATURDAY);

        const drawDatePickMap = this.getDrawDateNumbersMap();
        const lastDrawDatesFetchTime = this.getLastDrawDatesFetchTime();

        return (
            lastDrawDatesFetchTime === null ||
            lastDrawDatesFetchTime.isBefore(lastWednesday) ||
            lastDrawDatesFetchTime.isBefore(lastSaturday) ||
            (
                (
                    drawDatePickMap === null ||
                    !drawDatePickMap[lastWednesday.format('YYYY-MM-DD')] ||
                    !drawDatePickMap[lastSaturday.format('YYYY-MM-DD')]
                ) && (
                    lastDrawDatesFetchTime.isBefore(
                        moment.utc().subtract(DrawDatesService.FETCH_RETRY_SECONDS, 'seconds')
                    ) ||
                    lastDrawDatesFetchTime.isBefore(moment.utc().startOf('day'))
                )
            )
        );
    }

    generateDrawDatesAndPicksHashMap = (arrDrawDatesInfo) => {
        const drawDatePickMap = {};
        arrDrawDatesInfo.forEach(drawDateInfo => {
            drawDatePickMap[
                moment.utc(drawDateInfo.draw_date).format('YYYY-MM-DD')
            ] = this.generateWhiteAndRedBallLookup(drawDateInfo.winning_numbers);
        });
        return drawDatePickMap;
    }

    generateWhiteAndRedBallLookup = (winningNumbersText) => {

        const whiteBallsMap = {};
        let redBall;

        let numText = '';
        let numsFound = 0;
        for (const letter of winningNumbersText) {

            if (letter === ' ' && numsFound < 6) {
                whiteBallsMap[parseInt(numText)] = 1;
                numText = '';
                numsFound += 1;
            } else {
                numText += letter;
            }
        }

        // for red ball which appears at the end of the string
        redBall = parseInt(numText);

        return {whiteBallsMap, redBall};
    }

}

module.exports = new DrawDatesService();
