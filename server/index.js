const grpc = require("grpc");
const protoLoader = require("@grpc/proto-loader");
const server = new grpc.Server();

const loader = protoLoader.loadSync("proto/vacaciones.proto", {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const proto = grpc.loadPackageDefinition(loader);

server.addService(proto.work_leave.EmployeeLeaveDaysService.service, {
  eligibleForLeave(call, callback) {
    if (call.request.requested_leave_days > 0) {
      if (call.request.accrued_leave_days > call.request.requested_leave_days) {
        callback(null, { eligible: true });
      } else {
        callback(null, { eligible: false });
      }
      -1;
    } else {
      callback(new Error("Invalid requested days"));
    }
  },
  grantLeave(call, callback) {
    let granted_leave_days = call.request.requested_leave_days;
    let accrued_leave_days =
      call.request.accrued_leave_days - granted_leave_days;
    callback(null, {
      granted: true,
      granted_leave_days,
      accrued_leave_days,
    });
  },
});

server.bind("0.0.0.0:50050", grpc.ServerCredentials.createInsecure());

server.start();
console.log("grpc server running on port:", "0.0.0.0:50050");
