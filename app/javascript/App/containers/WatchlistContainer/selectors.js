import { createSelector } from 'reselect'

export const selectDomain = () => state => state.watchlist

export const selectEntities = () =>
  createSelector(selectDomain(), s => {
    return s.get('entities')
  })

export const selectCategory = () =>
  createSelector(selectDomain(), s => {
    return s.get('category')
  })

export const selectSearchedCoins = () =>
  createSelector(selectDomain(), s => {
    return s.get('searchedCoins')
  })
