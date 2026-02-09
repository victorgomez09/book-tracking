export const parseStatus = (status: string): string => {
    switch (status) {
        case "PENDING":
            return "PENDIENTE"
        case "READING":
            return "LEYENDO";
        case "COMPLETED":
            return "TERMINADO";
        default:
            return "ABANDONADO";
    }
}

export const parseStatusColor = (status: string): string => {
    switch (status) {
        case "PENDING":
            return "warning"
        case "READING":
            return "info";
        case "COMPLETED":
            return "success";
        default:
            return "error";
    }
}