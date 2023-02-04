import { proxies } from "../config";

class CORSProxy {
  public static randomProxy() {
    // No CORS proxy needed when running locally and accessed via localhost.
    // [::1] or 127.0.0.1 still require a proxy, because Easybell doesn't set
    // suitable CORS headers then.
    if (window.location.hostname == "localhost") {
      return;
    }

    return proxies[Math.floor(Math.random() * proxies.length)];
  }
}

export { CORSProxy };
