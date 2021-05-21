const axiosRetry = require('axios-retry');
const axios = require('axios');
const moment = require('moment');
const commonConstants = require('../constants/commonConstants');

/**
 * deals with operations related to fetching and caching draw dates and winning numbers
 */
class DrawDatesService {

    // config to avoid requesting draw date for given seconds if it fails
    static FETCH_RETRY_SECONDS = 300;

    constructor () {
        axiosRetry(axios, { retries: 3 });
        // contains a structure for efficient querying of winning numbers by draw dates
        this.drawDateNumbersMap = null;
        
        // tracks the most recent attempt to fetch draw date from endpoint
        // used with FETCH_RETRY_SECONDS to implement something like circuit breaker
        this.lastDrawDatesFetchTime = null;
    }

    // getters and setters for instance variables, fairly simple but added for easier unit testing
    setDrawDateNumbersMap = (drawDateNumbersMap) => this.drawDateNumbersMap = drawDateNumbersMap;
    getDrawDateNumbersMap = () => this.drawDateNumbersMap;
    setLastDrawDatesFetchTime = (lastDrawDatesFetchTime) => this.lastDrawDatesFetchTime = lastDrawDatesFetchTime;
    getLastDrawDatesFetchTime = () => this.lastDrawDatesFetchTime;

    /**
     * responsible to trigger fetching/caching draw dates if required and return it
     * Exampe output: [ {'2021-05-15': { whiteBallsMap: {1: 1, 2: 1, 3: 1, 4: 1, 5: 1}, redBall: 6 }}]
     * @returns {{date: { whiteBallsMap: {winningNumber: 1}, redBall: number }}} - drawDate with winning numbers
     */
    getDrawDateAndNumbersMap = async () => {
        await this.refreshDrawDatesIfRequired();
        return this.getDrawDateNumbersMap();
    }


    /**
     * fetches draw dates from public endpoint if required and updates the instance variable if fetch is successfull
     */
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

    /**
     * calls endpoint to fetch draw dates, handles any error and logs it
     * @returns response from the public endpoint containing draw dates and winning numbers
     */
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

    /**
     * @param {number} isoDayOfWeek - starts with sunday as 0 and saturday as 6
     * @returns {moment} start of day time of most recent occurance of the given day of week
     */
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

    /**
     * determines if draw date fetch from public endpoint is required based on few factors
     * - existence of most recent draw date winning numbers (which happen on wednesday and saturday)
     * - prevents fetching if last fetch was within configured time range
     * @returns {boolean} value indicating if fetching draw dates from public endpoint is required
     */
    isDrawDatesFetchRequired = () => {
        const lastWednesday = this.getLastOccuranceOfDayOfWeek(commonConstants.DAYS_OF_WEEK.WEDNESDAY);
        const lastSaturday = this.getLastOccuranceOfDayOfWeek(commonConstants.DAYS_OF_WEEK.SATURDAY);

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

    /**
     * transforms drawdates from public endpoint to a data structure which can query winning 
     * white balls and red ball for a given date with complexity O(1)
     * @param {{draw_date: string, winning_numbers: string}[]} arrDrawDatesInfo
     * @returns {{ dateInYMD: { whiteBallsMap: [winningNumber: 1], redBall: number }}[]}
     */
    generateDrawDatesAndPicksHashMap = (arrDrawDatesInfo) => {
        const drawDatePickMap = {};
        arrDrawDatesInfo.forEach(drawDateInfo => {
            drawDatePickMap[
                moment.utc(drawDateInfo.draw_date).format('YYYY-MM-DD')
            ] = this.generateWhiteAndRedBallLookup(drawDateInfo.winning_numbers);
        });
        return drawDatePickMap;
    }

    /**
     * generates a structure which transforms winning numbers from string 
     * to a structure which can test for a winning red ball or white ball in O(1) complexity
     * @param {string} winningNumbersText - space separated numbers in string
     * @returns {whiteBallsMap : { 'number': 1 }, redBall: number}
     */
    generateWhiteAndRedBallLookup = (winningNumbersText) => {

        const whiteBallsMap = {};

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
        const redBall = parseInt(numText);

        return {whiteBallsMap, redBall};
    }

}

module.exports = new DrawDatesService();
