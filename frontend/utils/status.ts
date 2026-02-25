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
            return "badge-warning"
        case "READING":
            return "badge-info";
        case "COMPLETED":
            return "badge-success";
        default:
            return "badge-error";
    }
}