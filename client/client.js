let grpc = require("grpc");
let protoLoader = require("@grpc/proto-loader");
let readline = require("readline");
//Read terminal Lines
let reader = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
//Load the protobuf
let proto = grpc.loadPackageDefinition(
  protoLoader.loadSync(
    "proto/vacaciones.proto",
    {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    }
  )
);
const REMOTE_SERVER = "0.0.0.0:50050";
let username;

//Create gRPC client
let empleados = [
  {
    id_empleado: 1,
    name: "Carlos Quiros",
    accrued_leave_days: 15,
    requested_leave_days: 0,
  },
  {
    id_empleado: 2,
    name: "Juan Quintero",
    accrued_leave_days: 15,
    requested_leave_days: 0,
  },
  {
    id_empleado: 3,
    name: "Jesucristo",
    accrued_leave_days: 10,
    requested_leave_days: 0,
  },
];

//create gRPC client
let client = new proto.work_leave.EmployeeLeaveDaysService(
  REMOTE_SERVER,
  grpc.credentials.createInsecure()
);

function getData() {
  reader.question("Ingrese id empleado: ", (id) => {
    reader.question("Ingrese número de días que pide: ", (num) => {
      let empleado = empleados.find(function (element) {
        return element.id_empleado == id;
      });
      empleado.requested_leave_days = parseFloat(num);
      startStream(empleado);
    });
  });
}

let startStream = (empleado) => {
  client.eligibleForLeave(empleado, (err, callback) => {
    if (!err) {
      if (callback.eligible) {
        client.grantLeave(empleado, (err, grant) => {
          console.log(grant);
        });
      } else {
        console.log(
          "Permiso denegado, supera el tiempo disponible para el permiso"
        );
      }
    } else {
      console.log(err, details);
    }
  });
  getDesition();
};

function getDesition() {
  reader.question("Quiere continuar? Si/No", (decision) => {
    if (decision.toLowerCase() == "Si") getData();
  });
}
getData();
