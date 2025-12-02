import envConfig from "@/config";
import { LoginResType } from "@/schemaValidations/auth.schema";

type CustomOptions = Omit<RequestInit, 'method'> & {
    baseUrl?: string | undefined;
}

class HttpError extends Error {
    status: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor({ status, payload }: { status: number; payload: any }) {
        super('Http Error');
        this.status = status;
        this.payload = payload;
    }
}

class SesstionToken {
    private token = '';
    get value() {
        return this.token;
    }
    set value(token: string) {
        // Nếu gọi method này ở server side thì ném lỗi
        if (typeof window === 'undefined') {
            throw new Error('Cannot set session token on server side');
        }
        this.token = token;
    }
}

export const clientSessionToken = new SesstionToken();

const request = async <Response>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    url: string,
    options?: CustomOptions | undefined) => {
    const body = options?.body ? JSON.stringify(options.body) : undefined;
    const baseHeaders = {
        'Content-Type': 'application/json',
        Authorization: clientSessionToken.value ? `Bearer ${clientSessionToken.value}` : ''
    };
    // Nếu không truyền baseUrl  (hoặc baseUrl là undefined) thì lấy từ biến môi trường
    // Nếu truyền baseUrl thì lấy giá trị truyền vào, truyền vào rỗng '' thì đồng nghĩa với việc chúng ta gọi API đến Nextjs Server

    const baseUrl = options?.baseUrl === undefined ? envConfig.NEXT_PUBLIC_API_URL : options.baseUrl;

    const fullUrl = url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`;

    const res = await fetch(fullUrl, {
        ...options,
        headers: {
            ...baseHeaders,
            ...options?.headers
        },
        body,
        method
    })
    const payload: Response = await res.json();
    const data = {
        status: res.status,
        payload
    }
    if (!res.ok) {
        throw new HttpError(data);
    }
    if (['/auth/login', '/auth/register'].includes(url)) {
        clientSessionToken.value = (payload as LoginResType).data.token;
    } else if ('/auth/logout'.includes(url)) {
        clientSessionToken.value = '';
    }
    return data;
}

const http = {
    get<Response>(
        url: string,
        options?: Omit<CustomOptions, 'body'> | undefined
    ) {
        return request<Response>('GET', url, options);
    },
    post<Response>(
        url: string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        body: any,
        options?: Omit<CustomOptions, 'body'> | undefined
    ) {
        return request<Response>('POST', url, { ...options, body });
    },
    put<Response>(
        url: string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        body: any,
        options?: Omit<CustomOptions, 'body'> | undefined
    ) {
        return request<Response>('PUT', url, { ...options, body });
    },
    delete<Response>(
        url: string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any  
        body: any,
        options?: Omit<CustomOptions, 'body'> | undefined
    ) {
        return request<Response>('DELETE', url, { ...options, body });
    }
}

export default http;