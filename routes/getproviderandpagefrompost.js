module.exports = function(req, res, next) {
	// console.log ("Query = ",JSON.stringify(req.query));
	// console.log ("Body = ",JSON.stringify(req.body));
	// console.log ("Params = ",JSON.stringify(req.params));
	let page = 101; let subpage = 0;
	if (typeof req.query.page !== "undefined") {
		page = req.query.page;
		if (typeof req.query.subpage !== "undefined") {
			subpage = req.query.subpage;
			//console.log("Query subpage=",subpage);
		}
	} else {
		if (typeof req.body.page !== "undefined") {
		  page = req.body.page;
		  if (typeof req.body.subpage !== "undefined") {
			subpage = req.body.subpage;
			//console.log("Body subpage=",subpage);
		  }
		} 
	}
	if (subpage !== "" && subpage > 0) {
		page = page + "-" + subpage;  
	}
	req.body["page"] = page;
	
    let provider = 0; let oldprovider = 0;
	if (typeof req.query.provider !== "undefined") {
        provider = req.query.provider;
	} else {
		if (typeof req.body.provider !== "undefined") {
          provider = req.body.provider;
		}
	} 
	if (typeof req.query.oldprovider !== "undefined") {
        oldprovider = req.query.oldprovider;
	} else {
		if (typeof req.body.oldprovider !== "undefined") {
          oldprovider = req.body.oldprovider;
		}
	} 
	if (oldprovider != provider) {
		req.body["page"] = "100";
		req.body["subpage"] = "1";
	}
	req.body["provider"] = provider;
	req.body["oldprovider"] = provider;
    return next();
};