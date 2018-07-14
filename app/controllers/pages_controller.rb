class PagesController < ApplicationController
  def show
    @page = params[:id] || 'home'
    render_404 unless page_known?
    redirect_to('/login') && return if member_page? && !current_user
    @body_id = "#{@page}-page"
    if @page == 'news' && !has_news_feature?
      render_404
    else
      render "pages/#{@page}"
    end
  end

  private

  def page_known?
    pages.include? @page
  end

  def member_page?
    member_pages.include? @page
  end

  def pages
    public_pages + member_pages
  end

  def public_pages
    %w[home about news ambassadors win-cofi]
  end

  def member_pages
    %w[]
  end

  def has_news_feature?
    current_user && $ld_client.variation('news', get_ld_user, false)
  end

  def get_ld_user
    {
      key: current_user.id,
      email: current_user.email,
      anonymous: false,
      custom: {
        username: current_user.username
      }
    }
  end

end
