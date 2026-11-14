# Steam Deals

A small web app that shows current Steam discounts and ranks them by a custom score: discount × rating × popularity, so well-reviewed, popular games with big discounts rise to the top.

**Live demo:** https://dmytrokhodiachyi.github.io/steam-deals/

## Features

- Live Steam deals from the CheapShark API
- Custom ranking: discount, positive review percentage and number of reviews (log scale)
- Games with fewer than 100 reviews are filtered out
- 13 interface languages, English by default, choice is remembered in the browser
- Responsive grid layout
- 10-minute response cache in localStorage, with a fallback to old data if the API is unavailable

## Tech

Plain HTML, CSS and JavaScript, no frameworks.

## Run locally

Clone the repo and open `index.html` in a browser (or use the VS Code "Live Server" extension).

## Notes

- Data comes from the [CheapShark API](https://apidocs.cheapshark.com/). Review counts there can differ from the numbers shown on Steam.
- Prices are in USD.
- Translations were made with the help of AI and may contain inaccuracies. Corrections are welcome.