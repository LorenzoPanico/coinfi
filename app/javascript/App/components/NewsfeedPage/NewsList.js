import React, { Component, Fragment } from 'react'
import _ from 'lodash'
import NewsListItem from './NewsListItem'
import LoadingIndicator from '../LoadingIndicator'
import Tips from './Tips'
import { easeBackOut, easeBackInOut } from 'd3-ease';
import NodeGroup from 'react-move/NodeGroup';

// import { shuffle, range } from 'd3-array';

const count = 15;
    function getData() {
        return count
    }

class NewsList extends Component {
  state = { initialRender: true, initialRenderTips:false, width: null, items: getData() }
  //     state = {
  //   width: null,
  //   items: getData(),
  // }

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

  mountOnScrollHandler() {
    if (window.isMobile) {
      const throttled = _.throttle(this.onScrollNewsFeedMobile, 500)
      $(window).scroll(throttled)
    } else {
      const throttled = _.throttle(this.onScrollNewsFeedDesktop, 500)
      $('#newsfeed').scroll(throttled)
    }
  }

  unmountOnScrollHandler() {
    $(window).off('scroll', this.onScrollNewsFeedMobile)
    $('#newsfeed').off('scroll', this.onScrollNewsFeedDesktop)
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

  setActiveNewsItem = (newsItem) => {
    const { setActiveEntity, enableUI } = this.props
    const tweetId = newsItem.get('url').split('/')[newsItem.get('url').split('/').length - 1]
      if (/twitter/.exec(newsItem.get('url')) !== null) {
        setActiveEntity({ type: 'twitterNews', id: newsItem.get('id'), tweetId  })
      }
      else {
        setActiveEntity({ type: 'newsItem', id: newsItem.get('id') })
      }
    if (window.isMobile) enableUI('bodySectionDrawer', { fullScreen: true })
  }

  closeTips() {
    this.props.newsfeedTips()
  }

  renderView(viewState, itemHeight, activeFilters, sortedNewsItems, initialRenderTips, isLoading) {
    if (
      initialRenderTips &&
      window.isMobile
    ) {
      return <Tips closeTips={this.closeTips.bind(this)} />;
    }
    else if (isLoading('newsItems')) {
      return (
        <div className="pa3 tc mt4">
          <div className="pointer">
            <h4 className="fw6 mv3 f4">Loading..</h4>
          </div>
        </div>
      )

    }
    else if (!viewState.sortedNewsItems.length) {
      return (
        <div className="pa3 tc mt4">
          <div className="pointer">
            <h4 className="fw6 mv3 f4">No results found</h4>
          </div>
          <div className="flex justify-between flex-wrap">
            <div className="f6 silver center">
              <span className="ph2">Try changing your search query or removing some filters</span>
            </div>
          </div>
        </div>
      )
    }

    const mappedItems = viewState.sortedNewsItems.map((newsItem) => (
      <NewsListItem
        key={newsItem.get('id')}
        newsItem={newsItem}
        {...this.props}
        setActiveNewsItem={this.setActiveNewsItem}
        selectCoin={(symbol) => this.selectCoin(symbol)}
      />
    ))
    return mappedItems
  }

  selectCoin(coinData) {
    const { setFilter, clearSearch, setActiveEntity } = this.props
    setActiveEntity({ type: 'coin', id: coinData.get('id') })
    let value = this.selectedCoins()
    value = union(value, [coinData.get('name')])
    setFilter({ key: 'coins', value })
    clearSearch()
  }


  render() {
    const itemHeight = this.state.initialRender ? 'auto' : 0
    const { newsItems, isLoading, activeEntity, activeFilters, sortedNewsItems, initialRenderTips } = this.props
          const { items, width } = this.state;

    const viewState = {
      activeEntity: activeEntity,
      newsItems: newsItems,
      sortedNewsItems: sortedNewsItems
    }
      console.log('list', viewState.sortedNewsItems)
    return (
      <Fragment>
        <div
          id="newsfeed"
          className="flex-auto relative overflow-y-hidden overflow-y-auto-m"
          style={
            !activeEntity && window.isMobile && !activeFilters.size && initialRenderTips
              ? {marginTop: '-65px', background: '#fff'}
              : {}
          }>
          {/* {this.renderView(viewState, itemHeight, activeFilters, sortedNewsItems, initialRenderTips, isLoading)} */}
          <NodeGroup
            data={viewState.sortedNewsItems}
            keyAccessor={(d) => d.get('updated_at')}

            start={() => ({
              x: 0,
              opacity: 0,
              color: 'black',
            })}

            enter={() => ([
              {
                x: [width * 0.4],
                color: ['#00cf77'],
                timing: { delay: 500, duration: 500, ease: easeBackOut },
              },
              {
                opacity: [1],
                timing: { duration: 500 },
              },
            ])}

            update={() => ({
              x: [width * 0.4], // handle interrupt, if already at value, nothing happens
              opacity: 1, // make sure opacity set to 1 on interrupt
              color: '#00a7d8',
              timing: { duration: 500, ease: easeBackOut },
            })}

            leave={() => ([
              {
                x: [width * 0.8],
                color: ['#ff0063', 'black'],
                timing: { duration: 750, ease: easeBackInOut },
              },
              {
                opacity: [0],
                timing: { delay: 750, duration: 500 },
              },
            ])}
          >
            {(nodes) => (
              <div style={{ margin: 10, height: count * 20, position: 'relative' }}>
                {nodes.map(({ key, state: { x, opacity, color } }) => (
                  <div
                    key={key}
                    style={{
                      transform: `translate(${x}px, ${key * 20}px)`,
                      opacity,
                      color,
                    }}
                  >
                    {key + 1} - {Math.round(x)}
                  </div>
                ))}
              </div>
            )}
          </NodeGroup>
          <div>
            {!isLoading('newsItems') &&
              isLoading('newsfeed') && <LoadingIndicator />}
          </div>
        </div>
      </Fragment>
    )
  }
}

export default NewsList
