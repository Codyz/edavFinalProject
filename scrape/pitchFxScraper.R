library(pitchRx)
library(RSQLite)
library(dplyr)

# db <- src_sqlite("pitch.sqlite3", create = T)
# download 2015 data d
# scrape(start = "2015-04-01", end = "2015-10-01", connect = db$con)

# download 2016 data
# db <- src_sqlite("pitch.sqlite3")
# scrape(start = "2016-04-01", end = "2016-10-01", connect = db$con)

# download 2017 data
db <- src_sqlite("pitch.sqlite3")
scrape(start = "2017-04-01", end = "2017-10-01", connect = db$con)

# SELECT * FROM atbat INNER JOIN pitch ON
# (atbat.num = pitch.num AND atbat.url = pitch.url)
