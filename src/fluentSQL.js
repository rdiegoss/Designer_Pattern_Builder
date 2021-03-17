export default class FluentSQLBuilder {
    _database = []
    _limit
    _select = []
    _where = []
    _orderBy = ''
    constructor({ database }) {
        this._database = database;
    }

    static for(database) {
        return new FluentSQLBuilder({ database })
    }

    limit(max) {
        this._limit = max;

        return this;
    }

    select(props) {
        this._select = props;

        return this;
    }

    where(query) {
        const [[prop, selectedValue]] = Object.entries(query);
        const whereFilter = selectedValue instanceof RegExp ?
            selectedValue:
            new RegExp(selectedValue);

        this._where.push({prop, filter: whereFilter})

        return this;
    }

    orderBy(field) {
        this._orderBy = field

        return this;
    }

    _performLimit(results) {
        return this._limit && results.length === this._limit
    }

    _performWhere(item) {
        for( const {filter, prop} of this._where) {
            if (!filter.test(item[prop])) return false
        }

        return true
    }

    _performSelect(item) {
       const currentItem = {}
       const entries = Object.entries(item);
       for (const [key, value] of entries) {
           if (this._select.length && !this._select.includes(key)) continue

           currentItem[key] = value
       }

       return currentItem
    }

    _performOrderBy(results) {
        if(!this._orderBy) return results;

        return results.sort((prev, next) => {
            return prev[this._orderBy].localeCompare(next[this._orderBy])
        })
     }

    build() {
        const results = []
        for(const item of this._database) {
            if (!this._performWhere(item)) continue;

            const currentItem = this._performSelect(item);
            results.push(currentItem)

            if (this._performLimit(results)) break;

        }

        const finalResult = this._performOrderBy(results)
        return finalResult
    }
}