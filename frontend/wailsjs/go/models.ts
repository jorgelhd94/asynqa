export namespace domain {
	
	export class Environment {
	    ID: number;
	    // Go type: time
	    CreatedAt: any;
	    // Go type: time
	    UpdatedAt: any;
	    // Go type: gorm
	    DeletedAt: any;
	    Name: string;
	    Host: string;
	    Password: string;
	    DB: number;
	    UseTLS: boolean;
	    TLSSkipVerify: boolean;
	
	    static createFrom(source: any = {}) {
	        return new Environment(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ID = source["ID"];
	        this.CreatedAt = this.convertValues(source["CreatedAt"], null);
	        this.UpdatedAt = this.convertValues(source["UpdatedAt"], null);
	        this.DeletedAt = this.convertValues(source["DeletedAt"], null);
	        this.Name = source["Name"];
	        this.Host = source["Host"];
	        this.Password = source["Password"];
	        this.DB = source["DB"];
	        this.UseTLS = source["UseTLS"];
	        this.TLSSkipVerify = source["TLSSkipVerify"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

export namespace services {
	
	export class DailyStats {
	    date: string;
	    processed: number;
	    failed: number;
	
	    static createFrom(source: any = {}) {
	        return new DailyStats(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.date = source["date"];
	        this.processed = source["processed"];
	        this.failed = source["failed"];
	    }
	}
	export class QueueStats {
	    queue: string;
	    size: number;
	    pending: number;
	    active: number;
	    scheduled: number;
	    retry: number;
	    archived: number;
	    completed: number;
	    processed: number;
	    failed: number;
	    processedTotal: number;
	    failedTotal: number;
	    latencyMs: number;
	    memoryUsage: number;
	    paused: boolean;
	
	    static createFrom(source: any = {}) {
	        return new QueueStats(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.queue = source["queue"];
	        this.size = source["size"];
	        this.pending = source["pending"];
	        this.active = source["active"];
	        this.scheduled = source["scheduled"];
	        this.retry = source["retry"];
	        this.archived = source["archived"];
	        this.completed = source["completed"];
	        this.processed = source["processed"];
	        this.failed = source["failed"];
	        this.processedTotal = source["processedTotal"];
	        this.failedTotal = source["failedTotal"];
	        this.latencyMs = source["latencyMs"];
	        this.memoryUsage = source["memoryUsage"];
	        this.paused = source["paused"];
	    }
	}
	export class DashboardData {
	    queues: QueueStats[];
	    totalTasks: number;
	    totalPending: number;
	    totalActive: number;
	    totalFailed: number;
	    history: DailyStats[];
	    serverCount: number;
	
	    static createFrom(source: any = {}) {
	        return new DashboardData(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.queues = this.convertValues(source["queues"], QueueStats);
	        this.totalTasks = source["totalTasks"];
	        this.totalPending = source["totalPending"];
	        this.totalActive = source["totalActive"];
	        this.totalFailed = source["totalFailed"];
	        this.history = this.convertValues(source["history"], DailyStats);
	        this.serverCount = source["serverCount"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

