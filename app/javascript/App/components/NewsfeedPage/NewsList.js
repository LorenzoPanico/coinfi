import React, { Component, Fragment } from "react"
import _ from "lodash"
import axios from "axios"
import NewsListItem from "./NewsListItem"
import LoadingIndicator from "../LoadingIndicator"
import Tips from "./Tips"

class NewsList extends Component {
  state = { initialRender: true, initialRenderTips: false }

  constructor(props) {
    super(props)
    this.mountOnScrollHandler = this.mountOnScrollHandler.bind(this)
    this.unmountOnScrollHandler = this.unmountOnScrollHandler.bind(this)
    this.onScrollNewsFeedMobile = this.onScrollNewsFeedMobile.bind(this)
    this.onScrollNewsFeedDesktop = this.onScrollNewsFeedDesktop.bind(this)
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({ initialRender: false })
    }, 60000)
    this.mountOnScrollHandler()
    this.requestRedditImg()
  }

  componentDidUpdate() {
    const timer = setInterval(() => {
      if (!window.isMobile && !window.isTablet) {
        this.props.fetchMoreNewsFeed()
      }
    }, 60000)
    clearInterval(timer)
  }

  componentWillUnmount() {
    this.unmountOnScrollHandler()
  }

  requestRedditImg() {
    const token =
      "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQGNvaW5maS5jb20iLCJpYXQiOjE1MzE3MzcxOTYsImV4cCI6MTU2MzI3MzE5Nn0.it91kBAMuzlKVd8vqaf241TGCureCi4muI21YN6MXfXObsUsQWpLlySWi3EgJk6Z0_GHfw-NnPtNh-Oc5tsE2ECMgfG-WMWNqtsIqJ7d9QaiNrD-NRBF0vctlV-2wYcLkHeoXds3ER0V2oKbhRW6yvbRHgLAZRC0j6LQpLvoWO0oznes078hhwDCLJBUVO8jL63fKBtCcB--cyFVlIjnyq4sPT8Aq_8rYaMY3BW-pznH0EZ5QgwRrvCwYcNI1lXeo699e7zPrusyoYbZi3sBrpEZqsxopzODDLkh58q3h_RL0iMXKJ7LMdXBcA3Rw9cBYIdxSKDGWEf1aUxeCADOkziLepAas58uEr65Pxvhs8eW10mu6Q-xUnilvEJiVbUo5UcK2H-2OnhNHV6CFXdC2_jVQQKHBkHYKF6Hs9DWSGCFjiOsbu2TH9HG2MqIgKEdht0RhX1K43yWPp1ZgAlqo0f-qKK_3yGL-zDN_wtwu_IFS_CIcnHEdDTH1RsfjGDa9WvI0oBEfNpCjM61tul9CPNb2bmvPkXcoV7H_5toeFkOwUYS3dvgUXdr3lALnXS-teWHjglA8rCYDoVfthkm4nap1xAN2gz9CHW2rwHyjaVgaVfMTbwhJp9r3qIWXwJbrQLSGay7z30240AZKHLglWQwOzoV4O52N9lz12iekzE"
    const url = "https://www.stripe.com"
    axios.get(url).then(function(response) {
      console.log(response)
    })
  }

  mountOnScrollHandler() {
    if (window.isMobile) {
      const throttled = _.throttle(this.onScrollNewsFeedMobile, 500)
      $(window).scroll(throttled)
    } else {
      const throttled = _.throttle(this.onScrollNewsFeedDesktop, 500)
      $("#newsfeed").scroll(throttled)
    }
  }

  unmountOnScrollHandler() {
    $(window).off("scroll", this.onScrollNewsFeedMobile)
    $("#newsfeed").off("scroll", this.onScrollNewsFeedDesktop)
  }

  onScrollNewsFeedMobile(e) {
    const $this = $(e.currentTarget)
    const bufferSpace = $this.height() / 3 + 300

    if (
      $this.scrollTop() + $this.height() + bufferSpace >=
      $(document).height()
    ) {
      this.props.fetchMoreNewsFeed()
    }
  }

  onScrollNewsFeedDesktop(e) {
    const $this = $(e.currentTarget)
    const bufferSpace = $this.height() / 3 + 400
    if (
      $this.scrollTop() + $this.innerHeight() + bufferSpace >=
      $this[0].scrollHeight
    ) {
      this.props.fetchMoreNewsFeed()
    }
  }

  setActiveNewsItem = newsItem => {
    const { setActiveEntity, enableUI } = this.props
    const tweetId = newsItem.get("url").split("/")[
      newsItem.get("url").split("/").length - 1
    ]
    if (/twitter/.exec(newsItem.get("url")) !== null) {
      setActiveEntity({ type: "twitterNews", id: newsItem.get("id"), tweetId })
    } else {
      setActiveEntity({ type: "newsItem", id: newsItem.get("id") })
    }
    if (window.isMobile) enableUI("bodySectionDrawer", { fullScreen: true })
  }

  closeTips() {
    this.props.newsfeedTips()
  }

  renderView(
    viewState,
    itemHeight,
    activeFilters,
    sortedNewsItems,
    initialRenderTips,
    isLoading
  ) {
    if (initialRenderTips && window.isMobile) {
      return <Tips closeTips={this.closeTips.bind(this)} />
    } else if (isLoading("newsItems")) {
      return (
        <div className="pa3 tc mt4">
          <div className="pointer">
            <h4 className="fw6 mv3 f4">Loading..</h4>
          </div>
        </div>
      )
    } else if (!viewState.sortedNewsItems.length) {
      return (
        <div className="pa3 tc mt4">
          <div className="pointer">
            <h4 className="fw6 mv3 f4">No results found</h4>
          </div>
          <div className="flex justify-between flex-wrap">
            <div className="f6 silver center">
              <span className="ph2">
                Try changing your search query or removing some filters
              </span>
            </div>
          </div>
        </div>
      )
    }

    const mappedItems = viewState.sortedNewsItems.map(newsItem => (
      <NewsListItem
        key={newsItem.get("id")}
        newsItem={newsItem}
        {...this.props}
        setActiveNewsItem={this.setActiveNewsItem}
        selectCoin={symbol => this.selectCoin(symbol)}
      />
    ))
    return mappedItems
  }

  selectCoin(coinData) {
    const { setFilter, clearSearch, setActiveEntity } = this.props
    setActiveEntity({ type: "coin", id: coinData.get("id") })
    let value = this.selectedCoins()
    value = union(value, [coinData.get("name")])
    setFilter({ key: "coins", value })
    clearSearch()
  }

  render() {
    const itemHeight = this.state.initialRender ? "auto" : 0
    const {
      newsItems,
      isLoading,
      activeEntity,
      activeFilters,
      sortedNewsItems,
      initialRenderTips
    } = this.props
    const viewState = {
      activeEntity: activeEntity,
      newsItems: newsItems,
      sortedNewsItems: sortedNewsItems
    }
    return (
      <Fragment>
        <div
          id="newsfeed"
          className="flex-auto relative overflow-y-hidden overflow-y-auto-m"
          style={
            !activeEntity &&
            window.isMobile &&
            !activeFilters.size &&
            initialRenderTips
              ? { marginTop: "-65px", background: "#fff", position: "absolute" }
              : {}
          }
        >
          {this.renderView(
            viewState,
            itemHeight,
            activeFilters,
            sortedNewsItems,
            initialRenderTips,
            isLoading
          )}
          <div>
            {!isLoading("newsItems") &&
              isLoading("newsfeed") && <LoadingIndicator />}
          </div>
        </div>
      </Fragment>
    )
  }
}

export default NewsList
